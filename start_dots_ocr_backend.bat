@echo off
REM DotsOCR Backend Service Startup Script for Windows
REM This script starts the Python-based DotsOCR service

echo ========================================
echo DotsOCR Backend Service Startup
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if we're in the correct directory
if not exist "dots.ocr" (
    echo ❌ dots.ocr directory not found
    echo Please run this script from the Numerizam project root
    pause
    exit /b 1
)

if not exist "backend\dots_ocr_service.py" (
    echo ❌ Backend service script not found
    echo Please ensure backend\dots_ocr_service.py exists
    pause
    exit /b 1
)

echo ✅ Starting DotsOCR Backend Service...
echo.
echo 📋 Service will be available at: http://localhost:5001
echo ⚠️  Keep this window open to maintain the service
echo    Press Ctrl+C to stop the service
echo.

REM Start the Python service
python start_dots_ocr_backend.py

echo.
echo Service stopped.
pause