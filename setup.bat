@echo off
echo ========================================
echo Smart Village Management System Setup
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm run install-all
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Environment files already created!
echo - backend/.env
echo - frontend/.env
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Before running the project:
echo 1. Make sure MongoDB is installed and running
echo 2. (Optional) Add your API keys to backend/.env:
echo    - ANTHROPIC_API_KEY for AI features
echo    - Email credentials for notifications
echo 3. (Optional) Add MAPBOX token to frontend/.env for maps
echo.
echo To start the project, run:
echo   npm run dev
echo.
echo Or start MongoDB first:
echo   mongod
echo.
pause
