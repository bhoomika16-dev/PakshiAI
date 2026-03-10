@echo off
echo Starting PakshiAI Core Services...

start "PakshiAI Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app:app --reload --host 0.0.0.0 --port 8000"
timeout /t 5
start "PakshiAI Frontend" cmd /k "cd frontend && npm run dev"

echo Services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000/docs
pause
