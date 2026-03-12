@echo off
echo Starting PakshiAI Full-Stack (Local Inference Mode)...

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b
)

:: Start Backend
echo Launching Backend API on http://localhost:8000...
start cmd /k "cd backend && uvicorn app:app --reload --port 8000"

:: Start Frontend
echo Launching Frontend on http://localhost:5173...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo PakshiAI is now launching.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
