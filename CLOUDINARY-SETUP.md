# 🌩️ Cloudinary Setup Guide

## Why We Need Cloudinary?

**Problem:** Render's free tier uses **ephemeral storage** - uploaded files disappear on every deployment/restart.

**Solution:** Upload profile pictures to **Cloudinary** (cloud storage) instead of local filesystem.

---

## Step 1: Create FREE Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email or Google
3. **Free tier includes:**
   - 25GB storage
   - 25GB bandwidth/month
   - Perfect for our voting system!

---

## Step 2: Get Your Credentials

After signing up:

1. Go to **Dashboard** (you'll land there automatically)
2. Look for **Account Details** section (top of page)
3. Copy these 3 values:

```
Cloud Name: _______________
API Key: __________________
API Secret: ________________
```

---

## Step 3: What I'll Do With Your Credentials

Once you provide the credentials, I'll:

1. ✅ **Update auth_routes.py** - Upload profile pictures to Cloudinary
2. ✅ **Update candidate_routes.py** - Upload candidate pictures to Cloudinary  
3. ✅ **Configure Render** - Add environment variables
4. ✅ **Deploy backend** - Push changes to GitHub
5. ✅ **Test uploads** - Verify pictures persist after deployment

---

## Step 4: Provide Credentials to Me

Just reply with:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abc123def456ghi789
```

---

## What Changes Will Be Made?

### Before (Current - Ephemeral Storage)
```python
# Saves to local filesystem
file.save('/uploads/profiles/user_1.jpg')
# ❌ File disappears on Render redeploy
```

### After (Cloudinary - Permanent Storage)
```python
# Uploads to Cloudinary cloud
result = cloudinary.uploader.upload(file)
url = result['secure_url']
# ✅ File stays forever, accessible worldwide via CDN
```

---

## Benefits of Cloudinary

✅ **Permanent storage** - Files never disappear  
✅ **Fast CDN delivery** - Images load quickly worldwide  
✅ **Auto optimization** - Reduces file sizes automatically  
✅ **Secure URLs** - HTTPS by default  
✅ **Free tier** - 25GB storage + bandwidth  
✅ **No code on frontend** - Images just work with new URLs

---

## Timeline

Once you provide credentials:
- Code updates: **5 minutes**
- Render configuration: **2 minutes**  
- Deployment: **3 minutes**
- Testing: **2 minutes**

**Total: ~12 minutes** to fix profile pictures permanently! 🎉

---

## Ready?

1. Sign up: https://cloudinary.com/users/register_free
2. Get your 3 credentials (Cloud Name, API Key, API Secret)
3. Reply with them here

I'll handle everything else! 🚀
