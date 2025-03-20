#!/bin/bash
echo "Starting backend..."
docker-compose up -d backend
echo "Waiting for backend to initialize (30s)..."
sleep 30
echo "Starting frontend..."
docker-compose up -d frontend
echo "All services started" 