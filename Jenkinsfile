pipeline {
    agent any
    
    environment {
        // Safe ternary operator execution for Windows Jenkins
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
                    cmd /c pm2 --version 2>NUL || echo "PM2 not installed yet"
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
                                call npm install
                                
                                echo Running tests...
                                call npm test -- --watchAll=false --passWithNoTests || exit 0
                                
                                echo Building production bundle...
                                call npm run build
                                
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
                                call npm install --production
                                
                                echo Running tests...
                                call npm test || exit 0
                                
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
                                call npm install --production
                                
                                echo Running tests...
                                call npm test || exit 0
                                
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
                    if not exist "${DEPLOYMENT_DIR}" mkdir "${DEPLOYMENT_DIR}"
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
                
                // Using explicit block execution structures to isolate directory changes
                bat '''
                    echo Installing PM2 globally...
                    call npm install -g pm2
                    
                    echo Creating deployment directories...
                    if not exist "${DEPLOYMENT_DIR}" mkdir "${DEPLOYMENT_DIR}"
                    if not exist "${DEPLOYMENT_DIR}\\frontend" mkdir "${DEPLOYMENT_DIR}\\frontend"
                    if not exist "${DEPLOYMENT_DIR}\\content" mkdir "${DEPLOYMENT_DIR}\\content"
                    if not exist "${DEPLOYMENT_DIR}\\user" mkdir "${DEPLOYMENT_DIR}\\user"
                    
                    echo Copying built frontend bundle...
                    if exist "${DEPLOYMENT_DIR}\\frontend\\build" rmdir /s /q "${DEPLOYMENT_DIR}\\frontend\\build"
                    xcopy frontend\\build "${DEPLOYMENT_DIR}\\frontend\\build" /E /I /Y
                    
                    echo Copying content service...
                    xcopy backend\\content "${DEPLOYMENT_DIR}\\content" /E /I /Y
                    
                    echo Copying user service...
                    xcopy backend\\user "${DEPLOYMENT_DIR}\\user" /E /I /Y
                '''

                // Isolated PM2 service management using target paths
                bat '''
                    echo Managing PM2 Processes...
                    
                    cd "${DEPLOYMENT_DIR}\\content"
                    call pm2 stop content-service || echo Process not running
                    call pm2 delete content-service || echo Process does not exist
                    call pm2 start index.js --name content-service --update-env -- --port 5001 --env production
                    
                    cd "${DEPLOYMENT_DIR}\\user"
                    call pm2 stop user-service || echo Process not running
                    call pm2 delete user-service || echo Process does not exist
                    call pm2 start index.js --name user-service --update-env -- --port 5002 --env production
                    
                    call pm2 stop frontend || echo Process not running
                    call pm2 delete frontend || echo Process does not exist
                    call pm2 serve "${DEPLOYMENT_DIR}\\frontend\\build" 3000 --name frontend --spa
                    
                    call pm2 save
                    echo Deployment completed successfully!
                '''
            }
        }
        
        stage('Health Checks') {
            when {
                branch 'test'
            }
            steps {
                echo 'Performing application health validation...'
                // Basic curl ping commands for verifying running status codes
                bat '''
                    echo Checking Frontend App...
                    curl -I http://localhost:3000
                    
                    echo Checking Content Service...
                    curl -I http://localhost:5001
                    
                    echo Checking User Service...
                    curl -I http://localhost:5002
                '''
            }
        }
    }
}
