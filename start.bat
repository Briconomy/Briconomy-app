@echo off
echo Starting Briconomy Property Management System...
echo Mobile-optimized PWA application
echo.

REM Kill any existing processes on ports 5173, 8000, and 8816
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8816" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Kill any remaining Deno processes
echo Killing Deno processes...
taskkill /F /IM deno.exe >nul 2>&1

REM Kill any remaining Node processes
echo Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1

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

REM Initialize database with comprehensive data
echo.
echo ========================================
echo   Initializing Database...
echo ========================================

REM Check if mongosh or mongo is available
where mongosh >nul 2>&1
if %errorlevel% equ 0 (
    echo Using mongosh to initialize database...
    mongosh briconomy scripts/comprehensive-data-init.js
    echo ✓ Core database initialized (users, properties, units, leases, etc.)
    goto :db_init_done
)

where mongo >nul 2>&1
if %errorlevel% equ 0 (
    echo Using mongo shell to initialize database...
    mongo briconomy scripts/comprehensive-data-init.js
    echo ✓ Core database initialized (users, properties, units, leases, etc.)
    goto :db_init_done
)

echo ⚠ Warning: MongoDB shell (mongosh/mongo) not found!
echo Please install MongoDB Shell from: https://www.mongodb.com/try/download/shell
echo Skipping core database initialization...

:db_init_done

echo.
echo Setting up additional collections and sample data...
echo Note: These steps are optional - core database is already initialized
echo.

echo Running init-pending-users.js...
call deno run -A scripts/init-pending-users.js 2>nul
if %errorlevel% equ 0 (
    echo ✓ Pending users collection initialized
) else (
    echo ⚠ Skipped: init-pending-users.js ^(run manually if needed^)
)

echo Running add-sample-applications.js...
call deno run -A scripts/add-sample-applications.js 2>nul
if %errorlevel% equ 0 (
    echo ✓ Sample applications added
) else (
    echo ⚠ Skipped: add-sample-applications.js ^(run manually if needed^)
)

echo Running setup-manager-properties.ts...
call deno run -A scripts/setup-manager-properties.ts 2>nul
if %errorlevel% equ 0 (
    echo ✓ Manager properties configured
) else (
    echo ⚠ Skipped: setup-manager-properties.ts ^(run manually if needed^)
)

echo.
echo ✓ Database initialization complete!
echo.

REM Start both development servers
echo Starting development servers...
echo Frontend will be available at: http://localhost:5173
echo API server will be available at: http://localhost:8816
echo.

REM Start API server minimized and hidden
start /min "" cmd /c deno task api >nul 2>&1

REM Start frontend dev server minimized and hidden
start /min "" cmd /c deno task dev >nul 2>&1

echo Servers are starting up in background...
echo.
echo ========================================
echo   Briconomy Application Started!
echo ========================================
echo Frontend: http://localhost:5173
echo API:      http://localhost:8816
echo ========================================
echo.
echo Your application should be ready in a few moments.
echo Both servers are running in the background.
echo.
echo Press any key to close this window
pause
