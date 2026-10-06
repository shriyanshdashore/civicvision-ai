@echo off
title CIVICVISION AI - Launcher
echo Starting CIVICVISION AI Platform...
echo ===================================

echo [1/2] Starting FastAPI Backend...
start "CIVICVISION Backend" /D "%~dp0backend" cmd /k "python main.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend...
start "CIVICVISION Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

echo Launching App in Browser...
start http://localhost:3000

echo ===================================
echo CIVICVISION AI is running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================
