pipeline {
    agent any

    environment {
        COMPOSE_FILE = "docker-compose.yml"
        PROJECT_NAME = "demo-microservices"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'test', url: 'https://github.com/altaf-sstech/test.git'
            }
        }

        stage('Verify Docker Setup') {
            steps {
                bat 'docker version'
                bat 'docker compose version'
            }
        }

        stage('Build Images') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% build'
            }
        }

        stage('Stop Old Containers') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% down'
            }
        }

        stage('Start Services') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% up -d'
            }
        }

        stage('Wait for Services') {
            steps {
                // wait for containers to be up
                bat 'timeout /t 30'
            }
        }

        stage('Health Check') {
            steps {
                bat '''
                echo Checking services...

                curl -f http://localhost:3000 || exit 1
                curl -f http://localhost:5001/content/health || exit 1
                curl -f http://localhost:5002/auth/health || exit 1
                '''
            }
        }

        stage('Show Running Containers') {
            steps {
                bat 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD Pipeline executed successfully!'
        }

        failure {
            echo '❌ Pipeline failed. Showing logs...'
            bat 'docker compose logs'
        }

        always {
            echo '✔ Pipeline execution completed'
        }
    }
}