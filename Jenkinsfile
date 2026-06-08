pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose.yml"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
            }
        }

        stage('Build Images') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker-compose down'
            }
        }

        stage('Start Services') {
            steps {
                bat 'docker-compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                bat '''
                timeout /t 30
                curl http://localhost:3000
                curl http://localhost:5001/content/health
                curl http://localhost:5002/auth/health
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}