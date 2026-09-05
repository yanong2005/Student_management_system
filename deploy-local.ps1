$ErrorActionPreference = 'Stop'

Write-Host "Student Monitoring System - Local Production Startup" -ForegroundColor Cyan

if (-not (Test-Path '.env')) {
    if (Test-Path '.env.example') {
        Copy-Item '.env.example' '.env'
        Write-Host "Created .env from .env.example" -ForegroundColor Yellow
    }
}

$php = Get-Command php -ErrorAction SilentlyContinue
if (-not $php) {
    throw "PHP is not installed or not in PATH. Install PHP 8.2+ and MySQL before running this app."
}

$serverHost = '127.0.0.1'
$serverPort = '8000'

try {
    $mysqlCheck = Test-NetConnection -ComputerName '127.0.0.1' -Port 3306 -WarningAction SilentlyContinue
    if (-not $mysqlCheck.TcpTestSucceeded) {
        Write-Host "Warning: MySQL/XAMPP is not responding on 127.0.0.1:3306. Start XAMPP MySQL and import xampp-schema.sql before using registration." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not verify MySQL on 127.0.0.1:3306. Start XAMPP MySQL and import xampp-schema.sql before using registration." -ForegroundColor Yellow
}

Write-Host "Starting PHP server on http://${serverHost}:${serverPort}" -ForegroundColor Green

& php -S "${serverHost}:${serverPort}" -t .
