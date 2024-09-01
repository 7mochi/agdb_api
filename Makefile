docker-build:
	docker build -t agdb:latest .

docker-run:
	docker compose up api mysql

docker-run-bg:
	docker compose up -d api mysql

docker-stop:
	docker compose down

docker-logs:
	docker compose logs -f