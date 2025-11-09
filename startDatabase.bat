@echo off
echo Starting Briconomy Property Management System Database...
echo.

REM Kill any existing processes on ports 5173, 8000, and 8816
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8816" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Kill Deno and Node processes
echo Killing Deno and Node processes...
taskkill /F /IM deno.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

REM Check MongoDB
echo Checking MongoDB status...
netstat -an | find ":27017" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB...
    start /min "MongoDB" mongod --dbpath "%cd%\data" --logpath "%cd%\data\mongodb.log"
    echo Waiting for MongoDB to start...
    timeout /t 8 /nobreak >nul
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

echo.
echo ========================================
echo   Initializing Database...
echo ========================================

echo Running init-all.js...
deno run -A scripts\init-all.js
if %errorlevel% equ 0 (
    echo ✓ Database initialized successfully
) else (
    echo ⚠ Warning: Database initialization exited with code %errorlevel%
)

echo.
echo Database initialization complete!
echo.
echo You can now start the application using:
echo   start.bat
pause
exit /b 0
