@echo off
setlocal enabledelayedexpansion

set "RELEASE_TAG=windows_linux"
set "PREFERRED_ASSET_NAME=bricllm-v1.0-windows-x86_64.zip"
set "INSTALL_DIR=bricllm"
set "BINARY_NAME=bricllm.exe"
set "DOWNLOAD_URL=https://github.com/Briconomy/Bricllm/releases/download/%RELEASE_TAG%/%PREFERRED_ASSET_NAME%"
set "RELEASE_API_URL=https://api.github.com/repos/Briconomy/Bricllm/releases/tags/%RELEASE_TAG%"
set "TEMP_DIR=%TEMP%\bricllm_%RANDOM%_%RANDOM%"

if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

set "TEMP_FILE=%TEMP_DIR%\%PREFERRED_ASSET_NAME%"

set "DOWNLOADED_FILE="

echo ========================================
echo   Bricllm Update Script
echo ========================================
echo.

echo [1/5] Downloading Bricllm release binary...
where powershell >nul 2>&1
if errorlevel 1 (
    echo Error: PowerShell is required to download the release asset
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

echo Downloading from: %DOWNLOAD_URL%
echo Target directory: %TEMP_DIR%

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop'; " ^
    "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; " ^
    "$primaryUrl = '%DOWNLOAD_URL%'; " ^
    "$releaseApi = '%RELEASE_API_URL%'; " ^
    "$downloadDir = '%TEMP_DIR%'; " ^
    "$preferredName = '%PREFERRED_ASSET_NAME%'; " ^
    "$targetPath = Join-Path $downloadDir $preferredName; " ^
    "try { " ^
    "    Write-Host 'Attempting primary download...'; " ^
    "    Invoke-WebRequest -Uri $primaryUrl -OutFile $targetPath -UseBasicParsing; " ^
    "    Write-Host \"Downloaded to: $targetPath\"; " ^
    "} catch { " ^
    "    Write-Host 'Primary download failed. Trying API discovery...'; " ^
    "    try { " ^
    "        $release = Invoke-RestMethod -Uri $releaseApi; " ^
    "        if (-not $release.assets -or $release.assets.Count -eq 0) { " ^
    "            throw 'No release assets available.'; " ^
    "        } " ^
    "        $candidate = $release.assets | Where-Object { $_.name -eq $preferredName -and $_.browser_download_url } | Select-Object -First 1; " ^
    "        if (-not $candidate) { " ^
    "            $candidate = $release.assets | Where-Object { $_.browser_download_url } | Select-Object -First 1; " ^
    "        } " ^
    "        if (-not $candidate) { " ^
    "            throw 'No downloadable asset found in release.'; " ^
    "        } " ^
    "        $targetPath = Join-Path $downloadDir $candidate.name; " ^
    "        Write-Host \"Downloading $($candidate.name)...\"; " ^
    "        Invoke-WebRequest -Uri $candidate.browser_download_url -OutFile $targetPath -UseBasicParsing; " ^
    "        Write-Host \"Downloaded to: $targetPath\"; " ^
    "    } catch { " ^
    "        Write-Host \"Error: $_\"; " ^
    "        exit 1; " ^
    "    } " ^
    "} " ^
    "Write-Output $targetPath"

if errorlevel 1 (
    echo Error: Unable to download release asset
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

set "DOWNLOADED_FILE=%TEMP_FILE%"

echo Checking for file: %DOWNLOADED_FILE%

if not exist "%DOWNLOADED_FILE%" (
    echo Error: Downloaded file not found at %DOWNLOADED_FILE%
    echo Checking temp directory contents:
    dir "%TEMP_DIR%"
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

for %%A in ("%DOWNLOADED_FILE%") do if %%~zA lss 1 (
    echo Error: Downloaded file is empty
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

echo.
echo [2/5] Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo.
echo [3/5] Extracting and installing binary...

echo Extracting ZIP file...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop'; " ^
    "$zipFile = '%DOWNLOADED_FILE%'; " ^
    "$destDir = '%INSTALL_DIR%'; " ^
    "Add-Type -AssemblyName System.IO.Compression.FileSystem; " ^
    "try { " ^
    "    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $destDir); " ^
    "    Write-Host 'Extraction successful'; " ^
    "} catch { " ^
    "    Write-Host \"Error extracting: $_\"; " ^
    "    exit 1; " ^
    "}"

if errorlevel 1 (
    echo Error: Failed to extract ZIP file
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

if not exist "%INSTALL_DIR%\%BINARY_NAME%" (
    echo Searching for binary in extracted files...
    for /r "%INSTALL_DIR%" %%F in (bricllm.exe) do (
        if exist "%%F" (
            echo Found binary at: %%F
            move /Y "%%F" "%INSTALL_DIR%\%BINARY_NAME%" >nul
            goto :found
        )
    )
    echo Error: Binary not found in extracted files
    rmdir /S /Q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
    :found
)

echo.
echo [4/5] Cleaning up...
rmdir /S /Q "%TEMP_DIR%" >nul 2>&1

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
