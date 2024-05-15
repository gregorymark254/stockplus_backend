SERVICE := rbt

docker_login:
	sudo docker login registry.gitlab.com

docker_build:
	sudo docker build -t registry.gitlab.com/gregorymark25/rbt_content_server .

docker_push:
	sudo docker push registry.gitlab.com/gregorymark25/rbt_content_server

build_service: docker_login docker_build docker_push