pipeline {
    environment {
        registry = 'cr.yandex/crpadf0io6tdcrtci8sq'
        registryCredential = 'yandex-cloud-credentials'

        githubCredentials = 'jenkins-github'
        githubUrl = 'https://github.com/opa-oz/alice-anime-dialog'

        imageName = 'anime-alice'
        imageTag = "master.${BUILD_ID}"

        envFile = 'dialogs-env-file'
        certificatesFile = 'dialog-certificates'
        remoteServerFile = 'anime-alice-vm'
	}

    agent any

    stages {

    	stage('Cloning repository') {
    		steps {
    			git credentialsId: githubCredentials, url: githubUrl

    			withCredentials([file(credentialsId: envFile, variable: 'DOT_ENV_FILE')]) {
					sh('cat "$DOT_ENV_FILE" > .env')
				}

    			withCredentials([file(credentialsId: certificatesFile, variable: 'CERTIFICATES')]) {
                    sh('cat "$CERTIFICATES" > certs.zip')
                    sh('unzip -o certs.zip')
                }
    		}
    	}

		stage('Build & Push docker image') {
			steps {
				script {
					docker.withRegistry("https://${env.registry}", registryCredential) {
						def dockerImage = docker.build("${env.registry}/${env.imageName}:${env.imageTag}")

						dockerImage.push()
					}
				}
			}
		}

		stage('Remote SSH') {
			steps {
				withCredentials([sshUserPrivateKey(credentialsId: remoteServerFile, keyFileVariable: 'identity')]) {
					script {
						def remote = [:]
						remote.name = 'dialogs'
						remote.host = 'anime-recommend.ru'
						remote.allowAnyHosts = true
						remote.user = 'opa_oz'
						remote.identityFile = identity

						sshPut remote: remote, from: './deploy/update.sh', into: '.'
						sshPut remote: remote, from: './deploy/clean.sh', into: '.'
						sshPut remote: remote, from: './deploy/run.sh', into: '.'

						sshCommand remote: remote, command: 'chmod +x update.sh'
						sshCommand remote: remote, command: 'chmod +x clean.sh'
						sshCommand remote: remote, command: 'chmod +x run.sh'
						sshCommand remote: remote, command: "IMAGE_NAME=${env.registry}/${env.imageName}:${env.imageTag} ./update.sh"
						sshCommand remote: remote, command: "./clean.sh"
						sshCommand remote: remote, command: "IMAGE_NAME=${env.registry}/${env.imageName}:${env.imageTag} ./run.sh"
					}
				}
			}
		}

    }
}
