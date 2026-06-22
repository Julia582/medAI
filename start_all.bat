@echo off
set NODE_PATH=C:\node-v22.14.0-win-x64
setlocal

echo Starting Backend...
start "MedAI Backend" cmd /c "title MedAI Backend && set PATH=%NODE_PATH%;%PATH% && cd /d C:\Myfiles\MedicalAI\backend && node dist/main.js"

echo Starting AI Service...
start "MedAI AI" cmd /c "title MedAI AI && set SSL_CERT_FILE= && C:\Users\julia\anaconda3\envs\medicalai\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend...
start "MedAI Frontend" cmd /c "title MedAI Frontend && set PATH=%NODE_PATH%;%PATH% && cd /d C:\Myfiles\MedicalAI\frontend && npx next dev"

echo.
echo All services starting...
echo Backend:  http://localhost:4000
echo AI:       http://localhost:8000
echo Frontend: http://localhost:3000
