#!/usr/bin/env bash
set -e

# Checking the database connection
scripts/wait-for-it.sh $DB_HOST:$DB_PORT

yarn run test