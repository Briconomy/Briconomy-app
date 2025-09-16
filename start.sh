#!/bin/bash

echo "Starting Briconomy Property Management System..."
echo "Mobile-optimized PWA application"
echo ""

# Kill any existing processes on ports 5173, 8000, and 8816
echo "Cleaning up existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8816 | xargs kill -9 2>/dev/null || true

# Kill any remaining Deno processes
echo "Killing Deno processes..."
pkill -f "deno" || true

# Kill any remaining Node processes
echo "Killing Node processes..."
pkill -f "node" || true

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

# Initialize database with comprehensive data
echo "Initializing database with comprehensive data..."
deno task init-db

if [ $? -eq 0 ]; then
    echo "Database initialization completed successfully"
else
    echo "Database initialization failed. Continuing with existing data..."
fi

# Start the full development environment
echo "Starting development servers..."
echo "Frontend will be available at: http://localhost:5173"
echo "API server will be available at: http://localhost:8000"
echo ""
echo "Database has been initialized with:"
echo "  - 10 users (admin, managers, caretakers, tenants)"
echo "  - 3 properties with complete details"
echo "  - 8 units with various statuses"
echo "  - 5 active leases"
echo "  - 8 payment records"
echo "  - 5 maintenance requests"
echo "  - 5 caretaker tasks"
echo "  - 5 reports"
echo "  - 6 notifications"
echo "  - 8 system settings"
echo "  - 8 audit log entries"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers in background and wait for them
deno task dev-full &

# Wait for processes
wait
