# 🚀 Deploy StockFlow for External Access

## 📋 Prerequisites
- Node.js installed
- MongoDB running locally or accessible
- Both backend and frontend code ready

## 🔧 Quick Setup (Windows)

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Build for Production
```bash
# Run from project root
build-production.bat
```

### 3. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run serve
```

## 🌐 Access URLs
- **Backend API**: `http://YOUR_IP:5000`
- **Frontend App**: `http://YOUR_IP:3000`

## 📱 Sharing with Others
1. Find your IP address (shown in build script)
2. Share `http://YOUR_IP:3000` with users
3. Make sure port 3000 and 5000 are open on your firewall

## 🔒 Security Notes
- This setup is for development/demo purposes
- For production, consider:
  - HTTPS/SSL certificates
  - Firewall configuration
  - Environment variable security
  - Database security

## 🛠️ Manual Configuration
If build script doesn't work:
1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Create `frontend/.env.production`:
   ```
   REACT_APP_API_URL=http://YOUR_IP:5000/api
   ```
3. Build: `cd frontend && npm run build`
4. Serve: `cd frontend && npx serve -s build -l 3000`

## 🐛 Troubleshooting
- **Can't connect**: Check firewall settings
- **API errors**: Ensure backend is running on 0.0.0.0
- **Build fails**: Check Node.js version compatibility

## 📞 Support
For issues, check the console logs in both backend and frontend terminals.
