#!/bin/bash

echo "Starting Briconomy Property Management System..."
echo "Mobile-optimized PWA application"
echo ""

# Kill any existing processes on ports 5173 and 8000
echo "Cleaning up existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
sleep 2

# Check if MongoDB is running
if ! pgrep -f "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /tmp/mongodb.log --dbpath ./data
    
    if [ $? -eq 0 ]; then
        echo "MongoDB started successfully"
    else
        echo "Failed to start MongoDB. Please ensure MongoDB is installed and running."
        exit 1
    fi
else
    echo "MongoDB is already running"
fi

# Initialize database if needed
echo "Checking database initialization..."
deno task init-db

# Start the full development environment
echo "Starting development servers..."
echo "Frontend will be available at: http://localhost:5173"
echo "API server will be available at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers in background and wait for them
deno task dev-full &

# Wait for processes
wait