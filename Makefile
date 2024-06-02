docker-build:
	docker build -t agdb:latest .

docker-run:
	docker-compose up api mysql

docker-run-bg:
	docker-compose up -d api mysql