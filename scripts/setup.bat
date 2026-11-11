@echo off
echo ========================================================
echo Setting up Scope2Pay AI (FastAPI + React + PayPal v2)
echo ========================================================

echo 1. Configuring Backend Python Environment...
cd backend
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo 2. Seeding Sample Data...
python -c "from app.main import app, seed_demo_data; seed_demo_data(); print('Demo database initialized!')"

echo 3. Configuring Frontend Dependencies...
cd ..\frontend
call npm install
call npm run build

echo ========================================================
echo Setup Complete!
echo To run backend: cd backend ^&^& .venv\Scripts\uvicorn app.main:app --reload --port 8000
echo To run frontend dev: cd frontend ^&^& npm run dev
echo ========================================================
pause
