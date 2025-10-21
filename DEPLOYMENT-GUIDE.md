# 🚀 Deployment Guide - Online Voting System

## Quick Start Deployment Options

### Option 1: Local Network Deployment (Recommended for Testing)
**Access from any device on your WiFi network**

#### Prerequisites
- ✅ Windows PC with project installed
- ✅ WiFi network
- ✅ PostgreSQL running

#### Steps

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Configure Backend for Network Access**
   - Backend already configured with `host='0.0.0.0'` in `app.py`
   - Frontend already has network access in `vite.config.js`

3. **Get Your IP Address**
   ```powershell
   ipconfig
   # Look for IPv4 Address under your WiFi adapter
   # Example: 192.168.31.96
   ```

4. **Start Servers**
   ```powershell
   # Terminal 1 - Backend
   cd backend
   .\venv\Scripts\Activate.ps1
   python app.py

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev -- --host
   ```

5. **Access From Any Device**
   - Frontend: `http://YOUR_IP:3001`
   - Backend: `http://YOUR_IP:5000`
   - Example: `http://192.168.31.96:3001`

---

### Option 2: Cloud Deployment (Railway + Netlify)

#### A. Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Prepare Backend**
   ```powershell
   cd backend
   
   # Create Procfile
   echo "web: gunicorn app:app" > Procfile
   
   # Install gunicorn
   pip install gunicorn
   pip freeze > requirements.txt
   ```

3. **Deploy to Railway**
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add environment variables:
     ```
     DB_TYPE=postgresql
     DB_HOST=<railway-postgres-host>
     DB_USER=<railway-user>
     DB_PASSWORD=<railway-password>
     DB_NAME=railway
     DB_PORT=5432
     SECRET_KEY=<generate-random-key>
     JWT_SECRET_KEY=<generate-random-key>
     FLASK_ENV=production
     ```

4. **Add PostgreSQL Database**
   - In Railway project, click "New" → "Database" → "PostgreSQL"
   - Copy connection details to environment variables
   - Run migration: Connect via Railway CLI and execute `voting_system.sql`

#### B. Frontend Deployment (Netlify)

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag & drop `dist` folder
   - OR connect GitHub repository
   - Set environment variable:
     ```
     VITE_API_URL=https://your-railway-backend.railway.app
     ```

---

### Option 3: ngrok Tunnel (Quick Demo)

1. **Install ngrok**
   ```powershell
   # Download from https://ngrok.com/download
   # Or use chocolatey:
   choco install ngrok
   ```

2. **Start Backend**
   ```powershell
   cd backend
   python app.py
   ```

3. **Create Tunnel**
   ```powershell
   ngrok http 5000
   ```

4. **Update Frontend API URL**
   - Copy ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Update `frontend/src/config/api.js`:
     ```javascript
     const API_URL = 'https://abc123.ngrok.io';
     ```

5. **Start Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

---

## Pre-Deployment Checklist

### Security
- [ ] Change default admin password
- [ ] Update `SECRET_KEY` in `.env`
- [ ] Update `JWT_SECRET_KEY` in `.env`
- [ ] Set `FLASK_ENV=production`
- [ ] Configure CORS for specific origins only
- [ ] Enable HTTPS (for cloud deployment)

### Database
- [ ] Backup current database
- [ ] Test database connection
- [ ] Run all migrations
- [ ] Create admin account

### Frontend
- [ ] Update API URLs for production
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Verify all routes work

### Backend
- [ ] Update `requirements.txt`: `pip freeze > requirements.txt`
- [ ] Test all API endpoints
- [ ] Check error logging
- [ ] Verify file upload paths

### Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test voting functionality
- [ ] Test admin panel
- [ ] Test on mobile devices
- [ ] Test vote reset at midnight

---

## Production Environment Variables

### Backend (.env)
```env
# Flask
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-production-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-production-key-min-32-chars

# Database (PostgreSQL Production)
DB_TYPE=postgresql
DB_HOST=your-db-host.com
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=voting_system_prod
DB_PORT=5432

# URLs
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com

# CORS
CORS_ORIGINS=https://your-frontend-url.com

# File Upload
UPLOAD_FOLDER=uploads/profile_pictures
MAX_FILE_SIZE=5242880
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Deployment Commands Reference

### Local Development
```powershell
# Start both servers
.\start-dev.ps1

# Or manually:
# Backend
cd backend
python app.py

# Frontend
cd frontend
npm run dev
```

### Production Build
```powershell
# Frontend
cd frontend
npm run build
npm run preview  # Test production build

# Backend
cd backend
pip install -r requirements.txt
gunicorn app:app  # Production server
```

### Database
```powershell
# Initialize database
cd backend
python init_db.py

# Create admin
python create_admin.py

# Backup database
pg_dump voting_system > backup.sql

# Restore database
psql voting_system < backup.sql
```

---

## Troubleshooting

### Frontend Build Issues
**Error: "Module not found"**
```powershell
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Out of memory"**
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Backend Deployment Issues
**Error: "Database connection failed"**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Test connection: `python backend/test_db_connection.py`

**Error: "Module not found"**
```powershell
pip install -r requirements.txt
```

### CORS Errors
Update `backend/app.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-url.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images
- Enable browser caching

### Backend
- Use production WSGI server (Gunicorn)
- Enable database connection pooling
- Implement Redis caching
- Use reverse proxy (Nginx)
- Enable gzip compression

### Database
- Create indexes on frequently queried columns
- Use connection pooling
- Regular VACUUM and ANALYZE
- Optimize queries with EXPLAIN ANALYZE

---

## Monitoring

### Application Monitoring
- Set up error tracking (Sentry)
- Monitor API response times
- Track user sessions
- Log all errors

### Database Monitoring
- Monitor connection count
- Track query performance
- Set up automated backups
- Monitor disk usage

---

## Support

For deployment issues:
1. Check logs in terminal
2. Verify environment variables
3. Test database connection
4. Check firewall settings
5. Review CORS configuration

---

**Made with ❤️ for secure and transparent voting**
