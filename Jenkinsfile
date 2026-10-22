
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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

        stage('Desplegar en NGINX') {
            steps {
                powershell '''
                    $origen = Join-Path $env:WORKSPACE "dist\\frontend\\browser"
                    $destino = "C:\\nginx-sites\\osinergmin"
                    $backup = "C:\\nginx-sites\\backups\\osinergmin"

                    if (-not (Test-Path "$origen\\index.html")) {
                        throw "No se encontraron los archivos compilados."
                    }

                    if (-not (Test-Path $destino)) {
                        throw "No existe la carpeta de destino: $destino"
                    }

                    New-Item -ItemType Directory -Path $backup -Force | Out-Null

                    $fecha = Get-Date -Format "yyyyMMdd_HHmmss"
                    $carpetaBackup = Join-Path $backup $fecha

                    New-Item -ItemType Directory -Path $carpetaBackup -Force | Out-Null

                    Copy-Item "$destino\\*" $carpetaBackup -Recurse -Force

                    robocopy $origen $destino /MIR /R:2 /W:2

                    $codigoRobocopy = $LASTEXITCODE

                    if ($codigoRobocopy -ge 8) {
                        throw "Error al copiar los archivos a NGINX: $codigoRobocopy"
                    }

                    Write-Host "Despliegue de Angular completado correctamente."

                    $global:LASTEXITCODE = 0
                '''
            }
        }

        
        stage('Verificar despliegue') {
            steps {
                powershell '''
                    $respuesta = Invoke-WebRequest `
                        -Uri "http://127.0.0.1:8085/" `
                        -UseBasicParsing `
                        -Proxy $null

                    if ($respuesta.StatusCode -ne 200) {
                        throw "NGINX no responde correctamente."
                    }

                    Write-Host "Frontend Angular disponible: HTTP 200"
                '''
            }
        }
    }
}
