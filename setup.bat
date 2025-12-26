@echo off
echo ========================================
echo Hisabdar Project Setup
echo ========================================
echo.

echo [1/2] Setting up Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend setup failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [2/2] Setting up Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend setup failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start Frontend: cd frontend && npm run dev
echo To start Backend:  cd backend && npm start
echo.
pause
