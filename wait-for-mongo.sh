#!/bin/sh
echo "⏳ Waiting for MongoDB to start..."
until nc -z mongo 27017; do
  sleep 1
done
echo "✅ MongoDB is up - starting billing service..."
node src/server.js

