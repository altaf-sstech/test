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
        NODE_ENV = 'production'
        DATABASE_URL = 'postgres://myuser:mypassword@localhost:5432/mydb'

        CONTENT_DIR = 'backend/content'
        USER_DIR = 'backend/user'
        FRONTEND_DIR = 'frontend'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${CONTENT_DIR}") {
                    bat 'npm install'
                }
                dir("${USER_DIR}") {
                    bat 'npm install'
                }
                dir("${FRONTEND_DIR}") {
                    bat 'npm install'
                }
            }
        }

        stage('Build React App') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat """
                    set REACT_APP_API_BASE_URL=http://localhost:5001
                    set REACT_APP_USER_API_URL=http://localhost:5002
                    npm run build
                    """
                }
            }
        }

        stage('Restart Backend (PM2)') {
            steps {
                bat """
                pm2 delete content-service || echo not running
                pm2 delete user-service || echo not running

                cd ${CONTENT_DIR}
                set DATABASE_URL=%DATABASE_URL%
                set PORT=5001
                pm2 start server.js --name content-service

                cd ../user
                set DATABASE_URL=%DATABASE_URL%
                set PORT=5002
                pm2 start server.js --name user-service

                pm2 save
                """
            }
        }

        stage('Deploy Frontend (PM2)') {
            steps {
                bat """
                pm2 delete frontend || echo not running

                cd ${FRONTEND_DIR}
                npm install -g serve
                pm2 start serve --name frontend -- -s build -l 3000

                pm2 save
                """
            }
        }

        stage('Health Check') {
            steps {
                bat 'curl http://localhost:5001/content/health'
                bat 'curl http://localhost:5002/auth/health'
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}