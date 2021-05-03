#!make

include .env
export $(shell sed 's/=.*//' .env)

current_dir = $(shell pwd)

test_env:
	echo $(PORT) $(REGISTRY)

build_tag:
	deploy/build.sh $(REGISTRY) ${tag}

build_testing:
	make build_tag tag=testing

build_master:
	make build_tag tag=master

push_tag:
	deploy/push.sh $(REGISTRY) ${tag}

push_testing:
	make push_tag tag=testing

push_master:
	make push_tag tag=master

deploy_testing: build_testing push_testing

deploy_master: build_master push_master

dbuild:
	docker build -t anime-alice .

drun:
	docker run --mount type=bind,src=$(current_dir)/logs,dst=/app/logs -p 2000:80 anime-alice

dclean:
	docker stop anime-alice && docker rm anime-alice

# -v $(current_dir)/logs:/app/logs
# --mount type=bind,src=$(current_dir)/logs,dst=/app/logs
