@echo off
setlocal enabledelayedexpansion

set "REPO_URL=https://github.com/Briconomy/Bricllm.git"
set "BUILD_DIR=bricllm-build"
set "INSTALL_DIR=bricllm"
set "BINARY_NAME=bricllm.exe"

echo ========================================
echo   Bricllm Update Script
echo ========================================
echo.

if not exist "%BUILD_DIR%" (
    echo [1/5] Cloning Bricllm repository...
    git clone "%REPO_URL%" "%BUILD_DIR%"
) else (
    echo [1/5] Updating Bricllm repository...
    cd "%BUILD_DIR%"
    git fetch origin
    git reset --hard origin/main
    cd ..
)

echo.
echo [2/5] Building Bricllm...
cd "%BUILD_DIR%"

if not exist "Makefile" (
    echo Error: Makefile not found in repository
    exit /b 1
)

make clean 2>nul
make

if not exist "%BINARY_NAME%" (
    echo Error: Build failed - binary not found
    exit /b 1
)

cd ..

echo.
echo [3/5] Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo.
echo [4/5] Installing binary...
copy /Y "%BUILD_DIR%\%BINARY_NAME%" "%INSTALL_DIR%\%BINARY_NAME%" >nul

echo.
echo [5/5] Verifying installation...
if exist "%INSTALL_DIR%\%BINARY_NAME%" (
    echo Installation successful!
    echo Binary location: %CD%\%INSTALL_DIR%\%BINARY_NAME%
    echo.
) else (
    echo Error: Binary verification failed
    exit /b 1
)

echo ========================================
echo   Update Complete!
echo ========================================
echo.
echo Bricllm is now integrated with the chatbot.
echo Restart your API server to use the updated LLM.
echo.

endlocal
