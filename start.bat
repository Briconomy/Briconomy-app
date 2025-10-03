@echo off
echo Starting Briconomy Property Management System...
echo Mobile-optimized PWA application
echo.

REM Kill any existing processes on ports 5173, 8000, and 8816
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8816" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Kill any remaining Deno processes
echo Killing Deno processes...
taskkill /f /im deno.exe >nul 2>&1

REM Kill any remaining Node processes
echo Killing Node processes...
taskkill /f /im node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

REM Check if MongoDB is running
echo Checking MongoDB status...
netstat -an | find ":27017" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB...
    start /min "MongoDB" mongod --dbpath "%cd%\data" --logpath "%cd%\data\mongodb.log"
    
    REM Wait for MongoDB to start
    echo Waiting for MongoDB to start...
    timeout /t 8 /nobreak >nul
    
    REM Check if MongoDB started successfully
    netstat -an | find ":27017" | find "LISTENING" >nul
    if %errorlevel% neq 0 (
        echo Failed to start MongoDB. Please ensure MongoDB is installed.
        pause
        exit /b 1
    )
    echo MongoDB started successfully
) else (
    echo MongoDB is already running
)

REM Initialize database if needed
echo Database initialization requires MongoDB shell tools which are not installed
echo Database will be initialized by the application on first run if needed

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
