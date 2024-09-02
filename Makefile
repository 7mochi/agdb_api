docker-build:
	docker build -t agdb:latest .

docker-dev-run:
	docker compose -f docker-compose.dev.yml up api mysql

docker-dev-run-bg:
	docker compose -f docker-compose.dev.yml up -d api mysql

docker-prod-run:
	docker compose -f docker-compose.prod.yml up api mysql

docker-prod-run-bg:
	docker compose -f docker-compose.prod.yml up -d api mysql

docker-stop:
	docker compose down

docker-logs:
	docker compose logs -f