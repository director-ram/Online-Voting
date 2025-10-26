# 🔐 Google OAuth - Localhost Setup Guide

## Quick Start (5 Minutes)

### 1. Add Localhost to Google Console

Go to: https://console.cloud.google.com/apis/credentials

**Edit your OAuth client** and add these URIs:

**Authorized JavaScript origins:**
```
http://localhost:5173
https://online-voting-system-mini.netlify.app
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
https://online-voting-3plz.onrender.com/api/auth/google/callback
```

Click **SAVE** and wait 5 minutes for Google to propagate changes.

---

### 2. Create Backend .env File

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your **real credentials** from Google Console:

```bash
# Database (localhost PostgreSQL)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=voting_system
DB_PORT=5432

# JWT Secret
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

# Google OAuth - Replace with YOUR credentials from Google Console
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# Localhost URLs
BACKEND_BASE_URL=http://localhost:5000
FRONTEND_BASE_URL=*
```

⚠️ **IMPORTANT:** The `.env` file is in `.gitignore` and will **never be committed** to GitHub!

---

### 3. Run Backend

**Terminal 1:**
```bash
cd backend
python app.py
```

Backend runs on: **http://localhost:5000**

---

### 4. Run Frontend

**Terminal 2:**
```bash
cd frontend
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

### 5. Test Google Login

1. Open: http://localhost:5173
2. Click **"Continue with Google"** button
3. Popup opens → Select your Google account
4. ✅ Login success! You're redirected to `/home`

---

## 🔄 Environment Detection (Automatic)

The app automatically detects which environment it's running in:

### Development (Localhost)
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Google redirects to: `http://localhost:5000/api/auth/google/callback`
- postMessage origin: `*` (any origin, for easy local testing)

### Production (Render + Netlify)
- Backend: `https://online-voting-3plz.onrender.com` (auto-detected via `RENDER_EXTERNAL_URL`)
- Frontend: `https://online-voting-system-mini.netlify.app`
- Google redirects to: `https://online-voting-3plz.onrender.com/api/auth/google/callback`
- postMessage origin: `https://online-voting-system-mini.netlify.app` (secure)

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** Make sure you added `http://localhost:5000/api/auth/google/callback` to Google Console and waited 5 minutes.

### Issue: "OAUTH_NOT_CONFIGURED"
**Solution:** Check that `backend/.env` has your real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Issue: Popup blocked
**Solution:** Allow popups for `http://localhost:5173` in browser settings.

### Issue: Token not saved after login
**Solution:** Check browser console for errors. Make sure both backend and frontend are running.

---

## 🔒 Security Best Practices

✅ **DO:**
- Store real credentials in `backend/.env` (local) and Render Environment Variables (production)
- Keep `.env` in `.gitignore`
- Use `FRONTEND_BASE_URL=*` for local development only

❌ **DON'T:**
- Commit `.env` file to Git
- Put real secrets in `.env.example`
- Share your `GOOGLE_CLIENT_SECRET` publicly

---

## 📊 File Structure

```
backend/
├── .env                 ← YOUR REAL SECRETS (gitignored, never committed)
├── .env.example         ← Placeholders (safe to commit, already in repo)
├── config.py            ← Reads from environment variables
├── app.py              ← Flask server
└── routes/
    └── auth_routes.py   ← Google OAuth endpoints

frontend/
├── src/
│   ├── pages/
│   │   └── Login.jsx    ← Google login button
│   └── config/
│       └── api.js       ← API_BASE_URL (auto-detects localhost vs production)
└── package.json
```

---

## ✅ Checklist

Before testing locally:

- [ ] Added localhost URIs to Google Console
- [ ] Created `backend/.env` with real credentials (from Google Console)
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] PostgreSQL database running locally
- [ ] Browser allows popups for localhost:5173

---

## 🚀 Production vs Development

| Setting | Development (Localhost) | Production (Render/Netlify) |
|---------|------------------------|------------------------------|
| Backend URL | `http://localhost:5000` | `https://online-voting-3plz.onrender.com` |
| Frontend URL | `http://localhost:5173` | `https://online-voting-system-mini.netlify.app` |
| OAuth Redirect | `http://localhost:5000/api/auth/google/callback` | `https://online-voting-3plz.onrender.com/api/auth/google/callback` |
| postMessage Origin | `*` (any) | `https://online-voting-system-mini.netlify.app` (restricted) |
| Secrets Source | `backend/.env` file | Render Environment Variables |

---

Need help? Check the main deployment guide or create an issue!
