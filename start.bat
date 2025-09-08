@echo off
echo Starting Briconomy Property Management System...
echo Mobile-optimized PWA application
echo.

REM Kill any existing processes on ports 5173 and 8000
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check if MongoDB is running
echo Checking MongoDB status...
mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting MongoDB...
    mongod --dbpath ./data --logpath ./data/mongodb.log --install
    net start MongoDB
    
    if %errorlevel% neq 0 (
        echo Failed to start MongoDB. Please ensure MongoDB is installed and running.
        pause
        exit /b 1
    )
    echo MongoDB started successfully
) else (
    echo MongoDB is already running
)

REM Initialize database if needed
echo Checking database initialization...
call deno task init-db

REM Start both development servers
echo Starting development servers...
echo Frontend will be available at: http://localhost:5173
echo API server will be available at: http://localhost:8000
echo.

REM Start API server minimized and hidden
start /min "" cmd /c deno task api >nul 2>&1

REM Start frontend dev server minimized and hidden
start /min "" cmd /c deno task dev >nul 2>&1

echo Servers are starting up in background...
echo Your application should be ready in a few moments.
echo Press any key to close this window
pause