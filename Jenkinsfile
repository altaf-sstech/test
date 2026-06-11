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







// pipeline {
//     agent any

//     environment {
//         DATABASE_URL = 'postgres://myuser:mypassword@localhost:5432/mydb'
//     }

//     stages {

//         stage('Checkout') {
//             steps {
//                 git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 dir('backend/content') {
//                     bat 'call npm install'
//                 }
//                 dir('backend/user') {
//                     bat 'call npm install'
//                 }
//                 dir('frontend') {
//                     bat 'call npm install'
//                 }
//             }
//         }

//         // stage('Build Frontend') {
//         //     steps {
//         //         dir('frontend') {
//         //             bat '''
//         //             set REACT_APP_API_BASE_URL=http://localhost:5001
//         //             set REACT_APP_USER_API_URL=http://localhost:5002
//         //             call npm run build
//         //             '''
//         //         }
//         //     }
//         // }


//         stage('Build Frontend') {
//             steps {
//                 ('frontend') {
//                 bat '''
//                 echo Cleaning old build folder...

//                 /c "rmdir /s /q build" >nul 2>&1 || echo no old build

//                 echo Setting environment...

//                 REACT_APP_API_BASE_URL=http://localhost:5001
//                 set REACT_APP_USER_API_URL=http://localhost:5002

//                 echo Building React app...

//                 call npm run build
//                 '''
//                 }
//             }
//         }

//         stage('Start Backend (PM2)') {
//             steps {
//                 bat '''
//                 echo Cleaning old PM2 processes...
                

//                 echo STARTING CONTENT SERVICE...
//                 cd backend\\content
//                 set PORT=5001
//                 set DATABASE_URL=%DATABASE_URL%
//                 call pm2 start index.js --name content-service

//                 echo STARTING USER SERVICE...
//                 cd ..\\user
//                 set PORT=5002
//                 set DATABASE_URL=%DATABASE_URL%
//                 call pm2 start index.js --name user-service

//                 echo PM2 STATUS:
//                 call pm2 list

//                 call pm2 save
//                 '''
//             }
//         }

//         stage('Start Frontend') {
//             steps {
//                 bat '''
//                 echo Cleaning old frontend...
                
//                 cd frontend

//                 echo Installing serve locally...
//                 call npm install serve

//                 echo Starting frontend using node (FINAL FIX)...

//                 call pm2 start node_modules\\serve\\build\\main.js --name frontend -- -s build -l 3000

//                 call pm2 save
//                 call pm2 list
//                 '''
//             }
//         }




//         stage('Verify') {
//             steps {
//                 bat '''
//                 echo ===== PM2 STATUS =====
//                 pm2 list

//                 echo ===== PORT CHECK =====
//                 netstat -ano | findstr :3000
//                 netstat -ano | findstr :5001
//                 netstat -ano | findstr :5002
//                 '''
//             }
//         }
//     }

//     post {
//         success {
//             echo '✅ Deployment SUCCESS'
//         }
//         failure {
//             echo '❌ Deployment FAILED'
//         }
//         always {
//             echo '✔ Pipeline Completed'
//         }
//     }
// }







pipeline {
    agent any

    environment {
        DOCKER_USER   = 'altaf7258'
        EC2_PUBLIC_IP = '13.239.134.203'
        APP_DIR       = '/home/ubuntu/app'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/altaf-sstech/test.git'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo "$PASS" | docker login -u "$USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push User Service') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/demo-user-service:latest backend/user
                docker push $DOCKER_USER/demo-user-service:latest
                '''
            }
        }

        stage('Build & Push Content Service') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/demo-content-service:latest backend/content
                docker push $DOCKER_USER/demo-content-service:latest
                '''
            }
        }

        stage('Build & Push Frontend') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/demo-frontend:latest frontend
                docker push $DOCKER_USER/demo-frontend:latest
                '''
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'KEY_FILE'
                )]) {
                    sh '''
                    chmod 600 $KEY_FILE

                    ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$EC2_PUBLIC_IP "
                    cd $APP_DIR &&
                    docker compose pull &&
                    docker compose up -d --force-recreate
                    "
                    '''
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
