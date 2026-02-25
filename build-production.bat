@echo off
echo 🚀 Building StockFlow for Production...

REM Get local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| find "IPv4"') do set LOCAL_IP=%%i
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 Your IP Address: %LOCAL_IP%

REM Update production env file with actual IP
echo REACT_APP_API_URL=http://%LOCAL_IP%:5000/api > frontend\.env.production

REM Build frontend
echo 📦 Building frontend...
cd frontend
npm run build

echo ✅ Build complete!
echo 🌐 Frontend will connect to: http://%LOCAL_IP%:5000/api
echo 📱 Share this URL with others: http://%LOCAL_IP%:3000
echo.
echo 🔧 To start the application:
echo    1. Backend: cd backend && npm run dev
echo    2. Frontend: cd frontend && npx serve -s build -l 3000
pause
