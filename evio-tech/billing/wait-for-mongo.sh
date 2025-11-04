#!/bin/sh

set -e

host="mongo"

echo "⏳ Waiting for MongoDB to start at $host:27017..."

until nc -z "$host" 27017; do
  sleep 2
done

echo "✅ MongoDB is up! Starting billing service..."
exec node src/server.js

