#!/bin/bash
export $(grep -v '^#' .env | xargs)

# stop containers
docker compose stop

# start with build containers
docker compose -f docker-compose-${CURRENT_ENV}.yml up --build -d
