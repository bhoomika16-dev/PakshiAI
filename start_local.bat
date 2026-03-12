@echo off
setlocal
echo =======================================================
echo PakshiAI - Automated Local Intelligence Launch
echo =======================================================

:: 1. Backend Synchronization
echo [1/3] Synchronizing Neural Inference Core...
py -m pip install -r requirements.txt --quiet

:: 2. Launch Backend
echo [2/3] Initializing FastAPI API Hub on http://localhost:8000...
start "PakshiAI Backend" cmd /k "cd backend && py -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

:: 3. Launch Frontend
echo [3/3] Deploying Vite Interface on http://localhost:5173...
start "PakshiAI Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Launch sequence complete. 
echo 🐦 Neural engines are synchronizing in the background windows.
echo.
echo Press any key to terminate this bridge...
pause > nul
