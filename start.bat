@echo off
echo Starting Briconomy Application Servers...
echo.

REM Kill any existing processes on dev ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8816" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM Kill old Deno instances
taskkill /F /IM deno.exe >nul 2>&1

echo.
echo Starting development servers...
echo Frontend: http://localhost:5173
echo API:      http://localhost:8816
echo.

REM Start backend API (hidden)
start /min "" cmd /c deno task api >nul 2>&1

REM Start frontend dev server (hidden)
start /min "" cmd /c deno task dev >nul 2>&1

echo Servers are starting in the background...
echo.
echo ========================================
echo   Briconomy App Started Successfully!
echo ========================================
echo Frontend: http://localhost:5173
echo API:      http://localhost:8816
echo ========================================
echo.
echo Press any key to close this window.
pause
