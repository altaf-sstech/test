pipeline {
    agent any
    
    environment {
        DOCKER_USER     = 'altaf7258'
        EC2_PUBLIC_IP   = '13.127.220.170'
        APP_DIR         = '/home/ubuntu/app'
    }
    
    stages {
        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    bat "docker login -u %USER% -p %PASS%"
                }
            }
        }

        stage('Build & Push User Service') {
            steps {
                echo 'Starting User Service Deployment Build...'
                bat "docker build -t %DOCKER_USER%/demo-user-service:latest ./backend/user"
                bat "docker push %DOCKER_USER%/demo-user-service:latest"
            }
        }

        stage('Build & Push Content Service') {
            steps {
                echo 'Starting Content Service Deployment Build...'
                bat "docker build -t %DOCKER_USER%/demo-content-service:latest ./backend/content"
                bat "docker push %DOCKER_USER%/demo-content-service:latest"
            }
        }

        stage('Build & Push Frontend Application') {
            steps {
                echo 'Starting Frontend Application Deployment Build...'
                bat "docker build -t %DOCKER_USER%/demo-frontend:latest ./frontend"
                bat "docker push %DOCKER_USER%/demo-frontend:latest"
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'KEY_FILE')]) {
                    bat """
                    @echo off
                    :: 1. Disable inheritance so permissions don't bleed down from the parent workspace folders
                    icacls "%KEY_FILE%" /inheritance:d /q
                    
                    :: 2. Remove access permissions for the default generic Windows Users group
                    icacls "%KEY_FILE%" /remove "BUILTIN\\Users" /q
                    icacls "%KEY_FILE%" /remove "Authenticated Users" /q
                    
                    :: 3. Grant explicit exclusive Full Control to the current executing user session
                    icacls "%KEY_FILE%" /grant:r "%USERNAME%:(F)" /q
                    
                    echo Permissions locked down successfully. Connecting to EC2...
                    
                    :: 4. Run the remote docker compose update command
                    ssh -i "%KEY_FILE%" -o StrictHostKeyChecking=no ubuntu@%EC2_PUBLIC_IP% "cd %APP_DIR% && docker compose pull && docker compose up -d --force-recreate"
                    """
                }
            } // Fixed: Added missing closing brace for steps
        } // Fixed: Added missing closing brace for stage
    }
    
    post {
        always {
            bat "docker logout"
        }
        success {
            echo "Deployment to AWS EC2 completed successfully!"
        }
        failure {
            echo "CI/CD Deployment failed. Check console output logs."
        }
    }
}
