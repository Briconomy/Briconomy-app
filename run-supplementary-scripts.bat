@echo off
echo.
echo ========================================
echo   Running Supplementary Database Scripts
echo ========================================
echo.
echo These scripts add optional test data:
echo - Pending users collection with indexes
echo - Sample tenant applications (3 applications)
echo - Manager property assignments
echo.

echo [1/3] Running init-pending-users.js...
deno run -A scripts/init-pending-users.js
if %errorlevel% equ 0 (
    echo ✓ Success
) else (
    echo ✗ Failed
)

echo.
echo [2/3] Running add-sample-applications.js...
deno run -A scripts/add-sample-applications.js
if %errorlevel% equ 0 (
    echo ✓ Success
) else (
    echo ✗ Failed
)

echo.
echo [3/3] Running setup-manager-properties.ts...
deno run -A scripts/setup-manager-properties.ts
if %errorlevel% equ 0 (
    echo ✓ Success
) else (
    echo ✗ Failed
)

echo.
echo ========================================
echo   Supplementary Scripts Complete
echo ========================================
echo.
pause
