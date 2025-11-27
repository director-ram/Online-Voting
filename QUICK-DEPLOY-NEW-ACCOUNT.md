# ⚡ Quick Deploy to New Render Account

## 🎯 5-Minute Quick Start

### 1. Create New Render Account
- Go to https://render.com/register
- Sign up with different email
- Verify email

### 2. Create Database (2 minutes)
```
Dashboard → New + → PostgreSQL
Name: voting-db
Database: voting_system
User: voting_user
→ Create Database
→ Copy Internal Database URL
```

### 3. Create Web Service (3 minutes)
```
Dashboard → New + → Web Service
Name: voting-backend
Runtime: Python 3
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

### 4. Set Environment Variables
```
FLASK_ENV=production
DEBUG=False
PORT=10000
DATABASE_URL=<paste-internal-database-url>
SECRET_KEY=<generate-32-chars>
JWT_SECRET_KEY=<generate-32-chars>
CORS_ORIGINS=*
```

**Generate Keys (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 5. Initialize Database
- Go to Database → Query tab
- Copy/paste contents of `database/voting_system.sql`
- Run it
- Create admin user (see full guide)

### 6. Test
```powershell
# Test health
Invoke-WebRequest -Uri "https://your-backend.onrender.com/api/health"
```

---

## 📝 Files Updated
- ✅ `backend/Procfile` - Updated to use PORT variable
- ✅ `render.yaml` - Updated start command

## 🔗 Next Steps
1. Update frontend API URL in `frontend/src/config/api.js`
2. Rebuild frontend: `npm run build`
3. Deploy frontend to Netlify

---

**Full detailed guide:** See `DEPLOY-NEW-RENDER-ACCOUNT.md`

