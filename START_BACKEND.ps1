# APEH-BE-CHARITY Backend Server Startup Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "APEH-BE-CHARITY Backend Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the api directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiPath = Join-Path $scriptPath "api"
Set-Location $apiPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env-template.txt" ".env"
    Write-Host ".env file created. Please edit it with your configuration." -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start




