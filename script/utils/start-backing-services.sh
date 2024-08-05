#!/bin/sh

echo "==> Starting the backing services in Docker..."

docker compose up --scale=app=0 -d

echo "==> Stubbing API endpoints"

npm run api-stubs:reset > /dev/null
npm run api-stubs:create > /dev/null
