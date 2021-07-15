pipeline {
    environment {
        registry = 'cr.yandex/crpadf0io6tdcrtci8sq'
        registryCredential = 'YaCloud'

        githubCredentials = 'github'
        githubUrl = 'https://github.com/opa-oz/alice-anime-dialog'

        imageName = 'anime-alice'
        imageTag = 'testing'

        envFile = credentials('dialogs-env')
	}

    agent any

    stages {

    	stage('Cloning repository') {
    		steps {
    			git credentialsId: githubCredentials, url: githubUrl

    			script {
    				sh('echo "$envFile" > .env')
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

    }
}
