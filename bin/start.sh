#!/usr/bin/env bash
set -e

echo "bv"
# Checking the database connection
bin/wait-for-it.sh $DB_HOST:$DB_PORT

# Starting the application in production mode
node dist/main.js
