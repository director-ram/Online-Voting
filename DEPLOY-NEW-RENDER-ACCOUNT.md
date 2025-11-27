# 🚀 Deploy to New Render Account - Step by Step Guide

## 📋 Prerequisites

1. **New Render Account**
   - Go to https://render.com/register
   - Sign up with a different email address
   - Verify your email

2. **Your Project Files**
   - All backend files are ready in `backend/` folder
   - `render.yaml` is configured
   - `requirements.txt` is present

---

## 🗄️ STEP 1: Create PostgreSQL Database

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com
   - Login with your NEW account

2. **Create PostgreSQL Database**
   - Click **"New +"** button (top right)
   - Select **"PostgreSQL"**
   - Fill in the details:
     ```
     Name: voting-db
     Database: voting_system
     User: voting_user
     Region: Choose closest to you (e.g., Oregon, Frankfurt)
     PostgreSQL Version: 15 (or latest)
     ```
   - Click **"Create Database"**
   - ⏳ **Wait 2-3 minutes** for database to be ready

3. **Save Database Connection Info**
   - Click on your database
   - Find **"Internal Database URL"** (starts with `postgresql://`)
   - **Copy and save this URL** - you'll need it later
   - Format: `postgresql://voting_user:password@host:port/voting_system`

---

## 🌐 STEP 2: Deploy Backend Web Service

### Option A: Using Render Blueprint (Recommended - Easiest)

1. **Prepare Your Code**
   - Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
   - OR use manual deployment (Option B)

2. **Create Blueprint**
   - In Render Dashboard, click **"New +"** → **"Blueprint"**
   - Connect your Git repository
   - Render will detect `render.yaml` automatically
   - Click **"Apply"**
   - Render will create both database and web service

### Option B: Manual Web Service Creation

1. **Create Web Service**
   - Click **"New +"** → **"Web Service"**
   - Choose one:
     - **"Build and deploy from a Git repository"** (if you have Git)
     - **"Deploy an existing image"** (if using Docker)
     - **"Public Git repository"** (if repo is public)

2. **Configure Service**
   ```
   Name: voting-backend
   Region: Same as database
   Branch: main (or master)
   Root Directory: (leave empty if backend is in root)
   Runtime: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
   ```

3. **Set Environment Variables**
   Go to **Environment** tab and add:
   ```
   FLASK_ENV=production
   DEBUG=False
   PORT=10000
   DATABASE_URL=<paste-internal-database-url-here>
   SECRET_KEY=<generate-random-32-chars>
   JWT_SECRET_KEY=<generate-random-32-chars>
   CORS_ORIGINS=*
   ```

   **Generate Secret Keys (PowerShell):**
   ```powershell
   # Run this twice to get two different keys:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will start building and deploying
   - ⏳ Wait 3-5 minutes for first deployment

---

## 🔧 STEP 3: Initialize Database

After backend is deployed, you need to initialize the database schema.

### Method 1: Using Render's SQL Editor (Easiest)

1. **Open Database in Render**
   - Go to your PostgreSQL database
   - Click **"Connect"** → **"Query"** tab

2. **Run Schema**
   - Open `database/voting_system.sql` from your project
   - Copy entire contents
   - Paste into Render's SQL editor
   - Click **"Run"**
   - ✅ Wait for success message

3. **Create Admin User**
   - Still in SQL editor, run:
   ```sql
   INSERT INTO users (name, email, password, role, created_at)
   VALUES (
     'Admin',
     'admin@voting.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5q5',  -- password: admin123
     'admin',
     NOW()
   );
   ```
   **Note:** The password hash above is for `admin123`. To generate your own:
   ```python
   import bcrypt
   password = bcrypt.hashpw('your-password'.encode(), bcrypt.gensalt()).decode()
   print(password)
   ```

### Method 2: Using Backend Script (After Deployment)

1. **SSH into Render Service** (if available)
   - Or use Render Shell
   - Navigate to backend directory
   - Run: `python init_db.py`

---

## ✅ STEP 4: Test Your Deployment

1. **Get Your Backend URL**
   - Go to your web service in Render
   - Find the URL (e.g., `https://voting-backend-xxxx.onrender.com`)

2. **Test Health Endpoint**
   ```powershell
   Invoke-WebRequest -Uri "https://your-backend-url.onrender.com/api/health"
   ```
   Should return: `{"status": "ok", "message": "Backend is running"}`

3. **Test Stats Endpoint**
   ```powershell
   Invoke-WebRequest -Uri "https://your-backend-url.onrender.com/api/stats"
   ```
   Should return stats with counts

4. **Test Candidates Endpoint**
   ```powershell
   Invoke-WebRequest -Uri "https://your-backend-url.onrender.com/api/candidates"
   ```
   Should return: `{"candidates": []}` (empty initially)

---

## 🎨 STEP 5: Update Frontend Configuration

1. **Update API URL**
   - Open `frontend/src/config/api.js`
   - Update the URL:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://your-new-backend-url.onrender.com';
   ```

2. **Rebuild Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

3. **Update CORS in Render** (if needed)
   - Go to your web service → Environment
   - Update `CORS_ORIGINS` to your frontend URL:
   ```
   CORS_ORIGINS=https://your-frontend.netlify.app
   ```

---

## 📝 STEP 6: Update Deployment Documentation

After successful deployment, update these files with your new URL:
- `frontend/src/config/api.js`
- `frontend/public/_redirects`
- `frontend/netlify.toml`

---

## 🔍 Troubleshooting

### "Application Error" on Render
- **Check Logs**: Dashboard → Service → Logs
- **Common Issues**:
  - Missing dependencies → Check `requirements.txt`
  - Database connection failed → Verify `DATABASE_URL`
  - Port binding error → Check `gunicorn` command

### "502 Bad Gateway"
- Service is starting (wait 30-60 seconds)
- Check if database is running
- Verify `DATABASE_URL` is correct

### Database Connection Failed
- Use **Internal Database URL** (not external)
- Format: `postgresql://user:pass@host:port/dbname`
- Make sure database is in same region as web service

### "CORS Error"
- Update `CORS_ORIGINS` in environment variables
- Make sure no trailing slash in URL
- Restart service after updating

---

## 🎯 Quick Checklist

```
NEW RENDER ACCOUNT SETUP
[ ] Created new Render account
[ ] Created PostgreSQL database
[ ] Saved Internal Database URL
[ ] Created web service
[ ] Set all environment variables
[ ] Deployed backend
[ ] Initialized database schema
[ ] Created admin user
[ ] Tested health endpoint
[ ] Tested API endpoints
[ ] Updated frontend API URL
[ ] Updated CORS settings
```

---

## 💡 Important Notes

### Free Tier Limits
- **Database**: 1 GB storage, 97 hours/month runtime
- **Web Service**: 750 hours/month, 512 MB RAM
- **Sleeps after 15 min inactivity** (wakes in ~30 seconds)
- **No credit card required!**

### Keep Service Awake (Optional)
Use **UptimeRobot** (free):
- Ping your backend URL every 5 minutes
- Keeps service awake during active hours
- Sign up at: https://uptimerobot.com

---

## 🎉 You're Done!

Your backend is now deployed on a new Render account!

**Save Your New URLs:**
- Backend: `https://your-backend-xxxx.onrender.com`
- Database: (Internal URL from Render dashboard)

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Check Logs**: Always check Render logs first for errors

