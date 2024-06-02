#!/usr/bin/env bash
set -e

echo "Loading environment variables from .env (Development)"
set -a
. ./.env
set +a

# Checking the database connection
bin/wait-for-it.sh $DB_HOST:$DB_PORT

# Starting the application in development mode
yarn run start:dev
