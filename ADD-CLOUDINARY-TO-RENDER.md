# 🌩️ Add Cloudinary to Render - Step by Step

## Your Cloudinary Credentials
```
Cloud Name: ddrfk2eue
API Key: 682346321923856
API Secret: iExYvGzrdBH9zdNh6KDcFqVNFag
```

---

## Step 1: Go to Render Dashboard

1. Open: https://dashboard.render.com/
2. Find your backend service: **online-voting-3plz**
3. Click on it

---

## Step 2: Add Environment Variables

1. Click **"Environment"** tab on the left sidebar
2. Scroll down to **"Environment Variables"** section
3. Click **"Add Environment Variable"** button (3 times - we need 3 variables)

---

## Step 3: Add Variable #1 - Cloud Name

**Key:** `CLOUDINARY_CLOUD_NAME`  
**Value:** `ddrfk2eue`

Click **"Save Changes"** or just proceed to next variable

---

## Step 4: Add Variable #2 - API Key

**Key:** `CLOUDINARY_API_KEY`  
**Value:** `682346321923856`

Click **"Save Changes"** or just proceed to next variable

---

## Step 5: Add Variable #3 - API Secret

**Key:** `CLOUDINARY_API_SECRET`  
**Value:** `iExYvGzrdBH9zdNh6KDcFqVNFag`

Click **"Save Changes"**

---

## Step 6: Verify Variables

You should now see all 3 variables:

```
CLOUDINARY_CLOUD_NAME = ddrfk2eue
CLOUDINARY_API_KEY = 682346321923856
CLOUDINARY_API_SECRET = iExYvGzrdBH9zdNh6KDcFqVNFag
```

*(Along with your existing DATABASE_URL, CORS_ORIGINS, etc.)*

---

## Step 7: Wait for Redeploy

After adding environment variables:
- Render will **automatically redeploy** your backend
- This takes about **2-3 minutes**
- You'll see "Deploying..." status at the top

---

## ✅ Done!

Once deployment completes:
- Profile pictures will upload to Cloudinary
- Images will persist forever (no more 404s!)
- URLs will look like: `https://res.cloudinary.com/ddrfk2eue/image/upload/...`

---

## 🚀 Next Steps

After Render finishes deploying:

1. I'll commit and push code changes to GitHub
2. Render will deploy again with new code
3. We'll test profile picture upload
4. Images should work permanently! 🎉

---

**Ready?** Go add those 3 environment variables to Render now! Let me know when you're done! 🔥
