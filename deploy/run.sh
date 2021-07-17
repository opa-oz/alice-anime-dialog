docker run --mount type=bind,src=$(pwd)/logs,dst=/app/logs -p 80:80 -p 443:443 -d ${IMAGE_NAME}
