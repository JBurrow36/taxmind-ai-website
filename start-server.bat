@echo off
echo Starting TaxMind AI Local Server...
echo.
echo Server will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause

