# 🚀 Render.com Deployment Guide (100% FREE)

## ✅ What You Get
- **Backend**: Python Flask API on Render
- **Database**: PostgreSQL on Render
- **Frontend**: Netlify (Drag & Drop)
- **Cost**: $0 - Completely FREE forever!
- **Setup Time**: ~20 minutes

---

## 📋 STEP 1: Deploy Backend to Render

### Create Render Account
1. Go to https://render.com/register
2. Sign up with email (no credit card needed)
3. Verify your email

### Deploy Backend via Dashboard

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com

2. **Create PostgreSQL Database**
   - Click "New +" button
   - Select "PostgreSQL"
   - Fill in:
     - Name: `voting-db`
     - Database: `voting_system`
     - User: `voting_user`
     - Region: Choose closest to you
   - Click "Create Database"
   - **Wait 2-3 minutes** for database to be ready

3. **Get Database URL**
   - Click on your database
   - Find "Internal Database URL" 
   - Copy it (save for later)

4. **Create Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Choose "Build and deploy from a Git repository"
   - Click "Next"

5. **Connect Repository** (We'll use manual upload)
   - Since no Git, we'll use Blueprint instead:
   - Click "New +" → "Blueprint"
   - OR continue with Web Service and upload manually

### Alternative: Manual Upload (Easier without Git)

1. **Create Web Service**
   - Dashboard → "New +" → "Web Service"
   - Select "Deploy an existing image from a registry"
   - OR use "Public Git repository"

2. **For Manual Deploy (Recommended)**
   Since you don't have Git, we'll use Render CLI:

---

## 📦 STEP 2: Prepare for Deployment

### Install Render CLI

```powershell
# Install via npm
npm install -g render-cli

# OR download from:
# https://render.com/docs/cli
```

### Login to Render

```powershell
render login
```
Browser will open, authorize the CLI.

### Deploy Backend

```powershell
cd C:\Users\khema\Desktop\MINI-porj_jagadeesh\online-voting-system\backend

# Create render.yaml in project root (already created!)
# Deploy using:
render deploy
```

---

## 🔧 STEP 3: Configure Environment Variables

In Render Dashboard → Your Web Service → Environment:

```env
FLASK_ENV=production
DEBUG=False
PORT=10000
DATABASE_URL=<your-postgres-internal-url>
SECRET_KEY=<generate-random-32-chars>
JWT_SECRET_KEY=<generate-random-32-chars>
CORS_ORIGINS=*
UPLOAD_FOLDER=uploads/profiles
MAX_CONTENT_LENGTH=16777216
```

**Generate Secret Keys:**
```powershell
# In PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
Run twice to get two different keys.

---

## 🗄️ STEP 4: Initialize Database

### Connect to Database

Use Render's built-in SQL editor:
1. Go to your PostgreSQL database in Render
2. Click "Connect" → "External Connection"
3. Use any PostgreSQL client (pgAdmin, TablePlus, etc.)

OR use Render's query console:
1. Click on database
2. Go to "Query" tab

### Run Schema

Copy contents from: `database/voting_system.sql`
Paste and execute in query console.

### Create Admin User

After schema is loaded, run:
```sql
INSERT INTO users (name, email, password, role, created_at)
VALUES (
  'Admin',
  'admin@voting.com',
  'scrypt:32768:8:1$xyz...', -- You'll need to hash this
  'admin',
  NOW()
);
```

**OR** use the backend script (after deployment):
```powershell
# This requires backend to be running
# We'll do this after deployment is complete
```

---

## 🎨 STEP 5: Deploy Frontend to Netlify

### Update API URL

1. Open: `frontend/src/config/api.js`
2. Change:
```javascript
const API_BASE_URL = 'https://your-app.onrender.com';
```
(Replace with your actual Render backend URL)

### Build Frontend

```powershell
cd C:\Users\khema\Desktop\MINI-porj_jagadeesh\online-voting-system\frontend
npm run build
```

### Deploy to Netlify

1. Go to https://app.netlify.com/drop
2. Drag the `frontend/dist` folder onto the page
3. Wait for upload (~30 seconds)
4. You'll get a URL like: `https://random-name-12345.netlify.app`

### Update CORS

Go back to Render Dashboard:
- Your web service → Environment
- Update `CORS_ORIGINS` to your Netlify URL:
```
CORS_ORIGINS=https://your-app.netlify.app
```
- Service will auto-redeploy

---

## ✅ STEP 6: Test Deployment

### Test Backend
```
https://your-app.onrender.com/api/candidates
```
Should return: `[]` (empty array)

### Test Frontend
1. Open your Netlify URL
2. You should see the login page
3. Try admin login:
   - Email: admin@voting.com
   - Password: admin123

---

## 🎯 Quick Deployment Checklist

```
RENDER.COM SETUP
[ ] Created Render account
[ ] Created PostgreSQL database
[ ] Copied database URL
[ ] Created web service
[ ] Configured environment variables
[ ] Deployed backend code
[ ] Uploaded database schema
[ ] Created admin user

NETLIFY SETUP
[ ] Updated API URL in frontend
[ ] Built frontend (npm run build)
[ ] Uploaded dist folder to Netlify
[ ] Got Netlify URL
[ ] Updated CORS in Render

TESTING
[ ] Backend API responds
[ ] Frontend loads
[ ] Admin login works
[ ] Can create candidates
[ ] Can vote
[ ] Can view results
```

---

## 💡 Important Notes

### Free Tier Limits (Render)
- **Database**: 1 GB storage, 97 hours/month runtime (resets monthly)
- **Web Service**: 750 hours/month, 512 MB RAM
- **Sleeps after 15 min inactivity** (wakes up in 30 seconds)
- No credit card required!

### Free Tier Limits (Netlify)
- **Bandwidth**: 100 GB/month
- **Build minutes**: 300/month
- **Sites**: Unlimited
- Completely free forever!

### Keep Service Awake (Optional)
Use a free service like **UptimeRobot** (uptimerobot.com):
- Ping your Render URL every 5 minutes
- Keeps service awake during active hours

---

## 🔧 Troubleshooting

### "Application Error" on Render
- Check build logs: Dashboard → Service → Logs
- Common issue: Missing dependencies
- Fix: Make sure `requirements.txt` is in backend folder

### "502 Bad Gateway"
- Service is starting up (wait 30 seconds)
- OR database connection issue
- Check DATABASE_URL is set correctly

### "CORS Error" in Frontend
- Update CORS_ORIGINS in Render to match Netlify URL
- Make sure no trailing slash

### Database Connection Failed
- Check DATABASE_URL format
- Use "Internal Database URL" not external
- Format: `postgresql://user:pass@host:port/dbname`

---

## 🌐 Your Live URLs

After deployment, save these:

### Backend (Render)
```
https://voting-backend.onrender.com
```

### Frontend (Netlify)
```
https://your-voting-app.netlify.app
```

### Database (Render)
```
Host: dpg-xxxxx.oregon-postgres.render.com
Port: 5432
Database: voting_system
User: voting_user
Password: [from Render dashboard]
```

---

## 🎉 You're Done!

Your voting system is now live on the internet, completely free!

Share your Netlify URL with anyone, anywhere in the world. 🚀

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Community**: Both have active Discord servers

---

**💰 Estimated Monthly Cost: $0.00**

Enjoy your free, professional deployment! 🎊
