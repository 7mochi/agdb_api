#!/usr/bin/env bash
set -e

# Checking the database connection
scripts/wait-for-it.sh $DB_HOST:$DB_PORT

# Starting the application in development mode
yarn run start:dev
