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

$host = '127.0.0.1'
$port = '8000'
Write-Host "Starting PHP server on http://$host:$port" -ForegroundColor Green

& php -S "$host:$port" -t .
