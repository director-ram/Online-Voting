# 🔄 URL Update Checklist - New Render Backend Account

When you deploy to a **new Render account**, you need to update URLs in multiple places. Here's the complete checklist:

---

## ✅ 1. FRONTEND FILES (3 files to update)

### File 1: `frontend/src/config/api.js`
**Current:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://online-voting-3plz.onrender.com';
```

**Update to:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-new-backend-url.onrender.com';
```

**How:**
- Open the file
- Replace `online-voting-3plz.onrender.com` with your new backend URL
- Save the file

---

### File 2: `frontend/public/_redirects`
**Current:**
```
/api/*  https://online-voting-3plz.onrender.com/api/:splat  200
```

**Update to:**
```
/api/*  https://your-new-backend-url.onrender.com/api/:splat  200
```

**How:**
- Open the file
- Replace the old URL with your new backend URL
- Save the file

---

### File 3: `frontend/netlify.toml`
**Current:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://online-voting-3plz.onrender.com/api/:splat"
  status = 200
```

**Update to:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-new-backend-url.onrender.com/api/:splat"
  status = 200
```

**How:**
- Open the file
- Replace the old URL with your new backend URL
- Save the file

**After updating these 3 files:**
- Rebuild frontend: `cd frontend && npm run build`
- Redeploy to Netlify (or it will auto-deploy if connected to Git)

---

## ✅ 2. GOOGLE CLOUD CONSOLE (OAuth Settings)

### What to Update
You need to update the **Authorized redirect URIs** in your Google OAuth credentials.

### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID
   - Click on it to edit

3. **Update Authorized redirect URIs**
   - Find the **"Authorized redirect URIs"** section
   - **Remove** the old redirect URI:
     ```
     https://online-voting-3plz.onrender.com/api/auth/google/callback
     ```
   - **Add** the new redirect URI:
     ```
     https://your-new-backend-url.onrender.com/api/auth/google/callback
     ```
   - Click **"Save"**

4. **Important Notes:**
   - The redirect URI must **exactly match** your backend URL
   - Must use `https://` (not `http://`)
   - Must include `/api/auth/google/callback` at the end
   - Changes take effect immediately (no waiting)

---

## ✅ 3. CLOUDINARY (No URL Changes Needed!)

### Good News! 🎉
**Cloudinary does NOT need URL updates!**

Cloudinary uses:
- **Cloud Name** (e.g., `ddrfk2eue`)
- **API Key** (e.g., `682346321923856`)
- **API Secret** (e.g., `iExYvGzrdBH9zdNh6KDcFqVNFag`)

These credentials are **independent** of your backend URL. They work with any backend.

### What You DO Need to Do:
Add Cloudinary credentials as **environment variables** in your **NEW Render account**:

1. Go to your new Render backend service
2. Click **"Environment"** tab
3. Add these 3 variables:
   ```
   CLOUDINARY_CLOUD_NAME = ddrfk2eue
   CLOUDINARY_API_KEY = 682346321923856
   CLOUDINARY_API_SECRET = iExYvGzrdBH9zdNh6KDcFqVNFag
   ```

That's it! No URL changes needed for Cloudinary.

---

## ✅ 4. RENDER ENVIRONMENT VARIABLES (Optional Updates)

### Check These Variables in New Render Account:

1. **BACKEND_BASE_URL** (if you set it manually)
   - Update to: `https://your-new-backend-url.onrender.com`
   - **Note:** This is usually auto-detected, so you might not need to set it

2. **GOOGLE_REDIRECT_URI** (if you set it manually)
   - Update to: `https://your-new-backend-url.onrender.com/api/auth/google/callback`
   - **Note:** This is usually auto-generated from BACKEND_BASE_URL, so you might not need to set it

3. **CORS_ORIGINS** (if you have a specific frontend URL)
   - If your frontend URL changed, update this:
   - Example: `https://your-frontend.netlify.app`
   - Or keep it as `*` to allow all origins

---

## 📋 Complete Update Checklist

```
FRONTEND FILES
[ ] Updated frontend/src/config/api.js
[ ] Updated frontend/public/_redirects
[ ] Updated frontend/netlify.toml
[ ] Rebuilt frontend (npm run build)
[ ] Redeployed frontend to Netlify

GOOGLE CLOUD CONSOLE
[ ] Logged into Google Cloud Console
[ ] Found OAuth 2.0 Client ID
[ ] Removed old redirect URI
[ ] Added new redirect URI
[ ] Saved changes

CLOUDINARY
[ ] Added CLOUDINARY_CLOUD_NAME to new Render account
[ ] Added CLOUDINARY_API_KEY to new Render account
[ ] Added CLOUDINARY_API_SECRET to new Render account

RENDER ENVIRONMENT VARIABLES
[ ] Verified BACKEND_BASE_URL (if set)
[ ] Verified GOOGLE_REDIRECT_URI (if set manually)
[ ] Updated CORS_ORIGINS (if frontend URL changed)

TESTING
[ ] Tested backend health endpoint
[ ] Tested frontend can connect to backend
[ ] Tested Google OAuth login
[ ] Tested profile picture upload (Cloudinary)
```

---

## 🧪 Testing After Updates

### Test 1: Backend Health
```powershell
Invoke-WebRequest -Uri "https://your-new-backend-url.onrender.com/api/health"
```
Should return: `{"status": "ok", "message": "Backend is running"}`

### Test 2: Frontend Connection
- Open your frontend URL
- Check browser console for API errors
- Try logging in

### Test 3: Google OAuth
- Click "Login with Google"
- Should redirect to Google
- After authorization, should redirect back to your app
- If you see "redirect_uri_mismatch" error, the Google Cloud Console update didn't work

### Test 4: Cloudinary Upload
- Try uploading a profile picture
- Should upload successfully
- Image URL should be from `res.cloudinary.com`

---

## ⚠️ Common Issues

### Issue 1: "redirect_uri_mismatch" Error
**Cause:** Google Cloud Console redirect URI doesn't match  
**Fix:** Double-check the redirect URI in Google Cloud Console matches exactly

### Issue 2: Frontend Can't Connect to Backend
**Cause:** Frontend still using old URL  
**Fix:** 
- Check `frontend/src/config/api.js`
- Rebuild frontend: `npm run build`
- Clear browser cache

### Issue 3: CORS Error
**Cause:** CORS_ORIGINS not set correctly  
**Fix:** Update CORS_ORIGINS in Render to match your frontend URL

### Issue 4: Profile Pictures Not Uploading
**Cause:** Cloudinary credentials not set in new Render account  
**Fix:** Add the 3 Cloudinary environment variables to Render

---

## 🎯 Quick Summary

**What Needs URL Updates:**
- ✅ Frontend files (3 files)
- ✅ Google Cloud Console (OAuth redirect URI)
- ❌ Cloudinary (no URL changes, just add credentials)

**What Stays the Same:**
- Cloudinary credentials (cloud name, API key, API secret)
- Database structure
- Application code

---

## 📝 Example: Your New Backend URL

After deploying to new Render account, you'll get a URL like:
```
https://voting-backend-abc123.onrender.com
```

Replace all instances of:
```
https://online-voting-3plz.onrender.com
```

With:
```
https://voting-backend-abc123.onrender.com
```

---

**Need help?** Check the logs in Render dashboard if something doesn't work!

