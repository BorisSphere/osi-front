
pipeline {
    agent any

    stages {
        stage('Verificar entorno') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Instalar dependencias') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Compilar Angular') {
            steps {
                bat 'npx ng build --configuration production'
            }
        }
    }
}
