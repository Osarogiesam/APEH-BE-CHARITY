@echo off
echo ========================================
echo APEH-BE-CHARITY Backend Server Startup
echo ========================================
echo.

REM Change to the correct directory
cd /d "%~dp0api"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy env-template.txt .env
    echo .env file created. Please edit it with your configuration.
    echo.
)

echo Starting backend server...
echo.
echo Server will run on: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

pause




