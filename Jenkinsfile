// pipeline {
//     agent any

//     environment {
//         COMPOSE_FILE = "docker-compose.yml"
//     }

//     stages {

//         stage('Checkout Code') {
//             steps {
//                 git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
//             }
//         }

//         stage('Verify Docker Setup') {
//             steps {
//                 bat 'docker version'
//                 bat 'docker compose version'
//             }
//         }

//         stage('Build Images') {
//             steps {
//                 bat 'docker compose -f %COMPOSE_FILE% build'
//             }
//         }

//         stage('Stop Old Containers') {
//             steps {
//                 bat 'docker compose -f %COMPOSE_FILE% down'
//             }
//         }

//         stage('Start Services') {
//             steps {
//                 bat 'docker compose -f %COMPOSE_FILE% up -d'
//             }
//         }

//         stage('Wait for Services') {
//             steps {
//                 // Fixed wait issue (no timeout command)
//                 bat 'powershell -Command "Start-Sleep -Seconds 30"'
//             }
//         }

//         stage('Health Check') {
//             steps {
//                 bat '''
//                 echo Checking services...

//                 curl -f http://localhost:3000 || exit 1
//                 curl -f http://localhost:5001/content/health || exit 1
//                 curl -f http://localhost:5002/auth/health || exit 1
//                 '''
//             }
//         }

//         stage('Show Running Containers') {
//             steps {
//                 bat 'docker ps'
//             }
//         }
//     }

//     post {
//         success {
//             echo '✅ CI/CD Pipeline executed successfully!'
//         }

//         failure {
//             echo '❌ Pipeline failed! Showing logs...'
//             bat 'docker compose logs'
//         }

//         always {
//             echo '✔ Pipeline completed'
//         }
//     }
// }







pipeline {
    agent any

    environment {
        DATABASE_URL = 'postgres://myuser:mypassword@localhost:5432/mydb'
        CONTENT_DIR = 'backend/content'
        USER_DIR = 'backend/user'
        FRONTEND_DIR = 'frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${CONTENT_DIR}") { bat 'call npm install' }
                dir("${USER_DIR}") { bat 'call npm install' }
                dir("${FRONTEND_DIR}") { bat 'call npm install' }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat '''
                    set REACT_APP_API_BASE_URL=http://localhost:5001
                    set REACT_APP_USER_API_URL=http://localhost:5002
                    call npm run build
                    '''
                }
            }
        }

        stage('Start Backend') {
            steps {
                bat '''
                echo Cleaning PM2...
                cmd /c "pm2 delete all" >nul 2>&1

                echo STARTING CONTENT SERVICE
                cd backend\\content
                set PORT=5001
                set DATABASE_URL=%DATABASE_URL%
                call pm2 start index.js --name content-service

                echo STARTING USER SERVICE
                cd ..\\user
                set PORT=5002
                set DATABASE_URL=%DATABASE_URL%
                call pm2 start index.js --name user-service

                echo PM2 STATUS:
                call pm2 list

                call pm2 save
                '''
            }
        }

        stage('Start Frontend') {
            steps {
                bat '''
                echo Cleaning old frontend...
                cmd /c "pm2 delete frontend" >nul 2>&1

                cd frontend

                echo Installing serve...
                call npm install -g serve

                echo STARTING FRONTEND (FINAL FIX)

                call pm2 start "C:\\Users\\Team\\AppData\\Roaming\\npm\\serve.cmd" --name frontend -- -s build -l 3000

                echo PM2 STATUS:
                call pm2 list

                call pm2 save
                '''
            }
        }

        stage('Verify') {
            steps {
                bat '''
                echo ===== PM2 STATUS =====
                pm2 list

                echo ===== PORT CHECK =====
                netstat -ano | findstr :3000
                netstat -ano | findstr :5001
                netstat -ano | findstr :5002
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment SUCCESS'
        }
        failure {
            echo '❌ Deployment FAILED'
        }
    }
}


