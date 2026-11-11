# Scope2Pay AI Windows PowerShell Setup Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Setting up Scope2Pay AI Environment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Backend
Write-Host "Configuring Python virtual environment in backend/..." -ForegroundColor Yellow
Set-Location -Path backend
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt
& .\.venv\Scripts\python.exe -c "from app.main import app, seed_demo_data; seed_demo_data(); print('Database seeded successfully!')"

# Frontend
Write-Host "Building React frontend in frontend/..." -ForegroundColor Yellow
Set-Location -Path ..\frontend
npm install
npm run build

Set-Location -Path ..
Write-Host "Setup Completed Successfully!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend UI: http://localhost:5173" -ForegroundColor Cyan
