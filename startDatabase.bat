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

where mongosh >nul 2>&1
if %errorlevel% equ 0 (
    mongosh briconomy scripts/comprehensive-data-init.js
    echo ✓ Core database initialized
    goto :db_init_done
)

where mongo >nul 2>&1
if %errorlevel% equ 0 (
    mongo briconomy scripts/comprehensive-data-init.js
    echo ✓ Core database initialized
    goto :db_init_done
)

echo ⚠ Warning: MongoDB shell not found, skipping core database initialization...

:db_init_done

echo Running additional setup scripts...
call deno run -A scripts/init-pending-users.js >nul 2>&1
call deno run -A scripts/add-sample-applications.js >nul 2>&1
call deno run -A scripts/setup-manager-properties.ts >nul 2>&1

echo.
echo Database initialization complete!
echo.
echo You can now start the application using:
echo   start.bat
pause
exit /b 0
