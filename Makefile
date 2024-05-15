SERVICE := stock_plus

docker_login:
	sudo docker login registry.gitlab.com

docker_build:
	sudo docker build -t registry.gitlab.com/gregorymark25/stock_plus .

docker_push:
	sudo docker push registry.gitlab.com/gregorymark25/stock_plus

build_service: docker_login docker_build docker_push