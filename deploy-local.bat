@echo off
cd /d "%~dp0"
PowerShell -ExecutionPolicy Bypass -NoProfile -File "%~dp0deploy-local.ps1"
