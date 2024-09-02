docker-dev-run:
	docker compose -f docker-compose.dev.yml up api mysql

docker-dev-run-bg:
	docker compose -f docker-compose.dev.yml up -d api mysql

docker-dev-stop:
	docker compose -f docker-compose.dev.yml down

docker-dev-logs:
	docker compose -f docker-compose.dev.yml logs

docker-prod-run:
	docker compose -f docker-compose.prod.yml up api mysql

docker-prod-run-bg:
	docker compose -f docker-compose.prod.yml up -d api mysql

docker-prod-stop:
	docker compose -f docker-compose.prod.yml down

docker-prod-logs:
	docker compose -f docker-compose.dev.yml logs