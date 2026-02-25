#!/bin/bash

echo "🚀 Building StockFlow for Production..."

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0) || LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "📍 Your IP Address: $LOCAL_IP"

# Update production env file with actual IP
sed "s/YOUR_IP_ADDRESS/$LOCAL_IP/g" frontend/.env.production.template > frontend/.env.production

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

echo "✅ Build complete!"
echo "🌐 Frontend will connect to: http://$LOCAL_IP:5000/api"
echo "📱 Share this URL with others: http://$LOCAL_IP:3000"
echo ""
echo "🔧 To start the application:"
echo "   1. Backend: cd backend && npm run dev"
echo "   2. Frontend: cd frontend && serve -s build -l 3000"
