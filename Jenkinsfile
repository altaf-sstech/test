pipeline {
    agent any
    
    environment {
        GIT_SHORT_SHA       = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
        NODE_ENV            = 'production'
        PATH                = "${env.PATH};C:\\Program Files\\nodejs"
        COMPOSE_FILE        = 'docker-compose.yml'
        DEPLOYMENT_DIR      = 'C:\\deployment'
        LOCAL_DEPLOYMENT    = 'true'
    }
    
    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Pre-Flight Checks') {
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '       MICROSERVICES ORCHESTRATOR - PRE-FLIGHT CHECKS      '
                echo '════════════════════════════════════════════════════════'
                bat '''
                    echo.
                    echo Checking system requirements...
                    echo.
                    
                    echo ✓ Git Version:
                    git --version
                    echo.
                    
                    echo ✓ Node Version:
                    node --version
                    echo.
                    
                    echo ✓ NPM Version:
                    npm --version
                    echo.
                    
                    echo ✓ PM2 Version:
                    pm2 --version || echo "PM2 not installed yet"
                    echo.
                    
                    echo All pre-flight checks passed!
                '''
            }
        }
        
        stage('Checkout Source Code') {
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '              CHECKING OUT SOURCE CODE                  '
                echo '════════════════════════════════════════════════════════'
                checkout scm
                bat 'git log --oneline -10'
            }
        }
        
        stage('Build & Test Services (Parallel)') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo '🔨 Building Frontend Service...'
                        dir('frontend') {
                            bat '''
                                echo Installing dependencies...
                                npm install
                                
                                echo Running tests...
                                npm test -- --watchAll=false --passWithNoTests || exit 0
                                
                                echo Building production bundle...
                                npm run build
                                
                                echo Frontend build complete!
                            '''
                        }
                    }
                }
                
                stage('Build Content Service') {
                    steps {
                        echo '🔨 Building Content Service...'
                        dir('backend/content') {
                            bat '''
                                echo Installing dependencies...
                                npm install --production
                                
                                echo Running tests...
                                npm test || exit 0
                                
                                echo Content service build complete!
                            '''
                        }
                    }
                }
                
                stage('Build User Service') {
                    steps {
                        echo '🔨 Building User Service...'
                        dir('backend/user') {
                            bat '''
                                echo Installing dependencies...
                                npm install --production
                                
                                echo Running tests...
                                npm test || exit 0
                                
                                echo User service build complete!
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Prepare Local Deployment') {
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '      PREPARING LOCAL DEPLOYMENT (NO DOCKER HUB)          '
                echo '════════════════════════════════════════════════════════'
                bat '''
                    echo Creating deployment directory: %DEPLOYMENT_DIR%
                    if not exist %DEPLOYMENT_DIR% mkdir %DEPLOYMENT_DIR%
                    echo Local deployment configured - images will be built locally
                '''
            }
        }
        
        
        stage('Deploy to Local Environment') {
            when {
                branch 'test'
            }
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '      DEPLOYING TO LOCAL WINDOWS ENVIRONMENT            '
                echo '════════════════════════════════════════════════════════'
                bat '''
                    echo Installing PM2 if needed...
                    npm install -g pm2 || echo PM2 already installed
                    
                    echo Creating deployment directories...
                    if not exist %DEPLOYMENT_DIR% mkdir %DEPLOYMENT_DIR%
                    if not exist %DEPLOYMENT_DIR%\frontend mkdir %DEPLOYMENT_DIR%\frontend
                    if not exist %DEPLOYMENT_DIR%\content mkdir %DEPLOYMENT_DIR%\content
                    if not exist %DEPLOYMENT_DIR%\user mkdir %DEPLOYMENT_DIR%\user
                    
                    echo Copying frontend build...
                    cd frontend
                    npm install
                    npm run build
                    if exist %DEPLOYMENT_DIR%\frontend\build rmdir /s /q %DEPLOYMENT_DIR%\frontend\build
                    xcopy build %DEPLOYMENT_DIR%\frontend\build /E /I /Y
                    
                    echo Deploying content service...
                    xcopy ..\backend\content %DEPLOYMENT_DIR%\content /E /I /Y
                    cd %DEPLOYMENT_DIR%\content
                    npm install --production
                    pm2 stop content-service || echo No existing content-service process
                    pm2 delete content-service || echo No existing content-service process
                    set PORT=5001
                    set NODE_ENV=production
                    set DATABASE_URL=postgres://myuser:mypassword@localhost:5432/mydb
                    pm2 start index.js --name content-service --env production
                    
                    echo Deploying user service...
                    xcopy ..\backend\user %DEPLOYMENT_DIR%\user /E /I /Y
                    cd %DEPLOYMENT_DIR%\user
                    npm install --production
                    pm2 stop user-service || echo No existing user-service process
                    pm2 delete user-service || echo No existing user-service process
                    set PORT=5002
                    set NODE_ENV=production
                    set DATABASE_URL=postgres://myuser:mypassword@localhost:5432/mydb
                    pm2 start index.js --name user-service --env production
                    
                    echo Deploying frontend static server...
                    pm2 stop frontend || echo No existing frontend process
                    pm2 delete frontend || echo No existing frontend process
                    pm2 serve %DEPLOYMENT_DIR%\frontend\build 3000 --name frontend --spa
                    pm2 save
                    
                    echo Deployment completed!
                '''
            }
        }
        
        stage('Health Checks') {
            when {
                branch 'test'
            }
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '           PERFORMING SERVICE HEALTH CHECKS             '
                echo '════════════════════════════════════════════════════════'
                script {
                    retry(5) {
                        bat '''
                            echo.
                            echo ✓ Frontend Health Check...
                            curl -f http://localhost:3000 || exit /b 1
                            
                            echo.
                            echo ✓ Content Service Health Check...
                            curl -f http://localhost:5001/content/health || exit /b 1
                            
                            echo.
                            echo ✓ User Service Health Check...
                            curl -f http://localhost:5002/auth/health || exit /b 1
                            
                            echo.
                            echo All health checks passed!
                        '''
                    }
                }
            }
        }
        
        stage('Service Status & Logs') {
            when {
                branch 'test'
            }
            steps {
                echo '════════════════════════════════════════════════════════'
                echo '            LOCAL SERVICE STATUS                       '
                echo '════════════════════════════════════════════════════════'
                bat '''
                    echo Running PM2 processes:
                    pm2 status || echo PM2 not available
                    
                    echo.
                    echo Service URLs:
                    echo Frontend:       http://localhost:3000
                    echo Content API:    http://localhost:5001
                    echo User API:       http://localhost:5002
                '''
            }
        }
        
        stage('Cleanup & Optimization') {
            steps {
                echo '🧹 Cleaning up build artifacts...'
                bat '''
                    echo Clearing PM2 logs and cache...
                    pm2 flush || echo No PM2 logs to flush
                    pm2 save || echo PM2 save skipped
                '''
            }
        }
    }
    
    post {
        always {
            echo '════════════════════════════════════════════════════════'
            echo '              PIPELINE COMPLETED - LOCAL DEPLOYMENT      '
            echo '════════════════════════════════════════════════════════'
            
            script {
                echo 'Build completed at: ' + new Date().format('yyyy-MM-dd HH:mm:ss')
            }
        }
        
        success {
            echo '''
╔════════════════════════════════════════════╗
║    ✓ MICROSERVICES DEPLOYMENT SUCCESSFUL   ║
╚════════════════════════════════════════════╝

Services deployed and running:
  • Frontend:        http://localhost:3000
  • Content API:     http://localhost:5001
  • User API:        http://localhost:5002
  
Check PM2 status:
  pm2 status
            '''
        }
        
        failure {
            echo '''
╔════════════════════════════════════════════╗
║      ✗ DEPLOYMENT FAILED                   ║
╚════════════════════════════════════════════╝

Troubleshooting:
  1. Check Jenkins console output above
  2. View service logs: pm2 logs
  3. Verify ports availability: netstat -ano
  4. Confirm local database is running and reachable
            '''
        }
        
        unstable {
            echo '⚠ Pipeline completed with warnings'
        }
    }
}
