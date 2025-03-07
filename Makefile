docker-dev-build:
	docker compose -f docker-compose.dev.yml build --no-cache

docker-dev-run:
	docker compose -f docker-compose.dev.yml up api mysql

docker-dev-run-bg:
	docker compose -f docker-compose.dev.yml up -d api mysql

docker-dev-stop:
	docker compose -f docker-compose.dev.yml down

docker-dev-logs:
	docker compose -f docker-compose.dev.yml logs

docker-prod-build:
	docker compose -f docker-compose.prod.yml build --no-cache

docker-prod-run:
	docker compose -f docker-compose.prod.yml up api mysql

docker-prod-run-bg:
	docker compose -f docker-compose.prod.yml up -d api mysql

docker-prod-stop:
	docker compose -f docker-compose.prod.yml down

docker-prod-logs:
	docker compose -f docker-compose.dev.yml logs

docker-run-migrations:
	docker exec -it -w /usr/src/app agdb_api-api-1 yarn migration:run

docker-run-tests:
	docker compose -f docker-compose.test.yml up -d api-test mysql-test
	docker compose -f docker-compose.test.yml exec -T api-test /usr/src/app/scripts/run-tests.sh
	docker compose -f docker-compose.test.yml down