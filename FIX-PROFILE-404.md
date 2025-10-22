# 🔧 Fix Profile Picture 404 Errors

## Problem
Old profile pictures in database still point to local paths like `/uploads/profiles/1_dark-naruto-1n.jpg`, but these files don't exist on Render (ephemeral storage).

## Solution
Clear old profile picture paths from database so users can re-upload with Cloudinary.

---

## Option 1: Run Python Script (EASIEST - RECOMMENDED)

Since Render doesn't show a Shell tab for your database, use this Python script instead:

### Steps:

1. **Get your Database URL from Render:**
   - Go to: https://dashboard.render.com/
   - Click on your **PostgreSQL database** (voting-db)
   - Look for **"Internal Database URL"** or **"External Database URL"**
   - Click the **Copy** icon 📋 next to it
   - It looks like: `postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/dbname`

2. **Run the cleanup script:**
   Open terminal in VS Code and run:
   ```powershell
   cd backend
   C:\Users\khema\AppData\Local\Programs\Python\Python312\python.exe clean_db.py "PASTE_YOUR_DATABASE_URL_HERE"
   ```
   
   Replace `PASTE_YOUR_DATABASE_URL_HERE` with the URL you copied.

3. **Expected output:**
   ```
   📡 Connecting to database...
   ✅ Connected successfully!
   
   📋 Checking users table...
      Found 1 users with old paths:
      • User 1 (user@email.com): /uploads/profiles/1_dark-naruto-1n.jpg
      ✅ Cleaned 1 old paths from users
   
   ✅ DATABASE CLEANED SUCCESSFULLY!
   ```

---

## Option 2: Run SQL on Render Dashboard

### Steps:

1. **Go to Render Dashboard:**
   - https://dashboard.render.com/

2. **Find your PostgreSQL database**
   - Click on your database (not the backend service)

3. **Open Shell tab:**
   - Click "Shell" in the left sidebar
   - This opens a psql terminal

4. **Run these SQL commands:**

```sql
-- Clear old profile pictures from users table
UPDATE users 
SET profile_pic = NULL 
WHERE profile_pic LIKE '/uploads/%';

-- Clear old profile pictures from candidates table
UPDATE candidates 
SET profile_pic = NULL 
WHERE profile_pic LIKE '/uploads/%';

-- Verify the fix
SELECT COUNT(*) FROM users WHERE profile_pic LIKE '/uploads/%';
SELECT COUNT(*) FROM candidates WHERE profile_pic LIKE '/uploads/%';
-- Both should return 0
```

5. **Expected Output:**
```
UPDATE 1  (or however many old pictures existed)
UPDATE 1  (or however many candidates had old pictures)
 count 
-------
     0
(1 row)
```

---

## Option 2: Alternative SQL Method

If you have database connection details, you can also run:

```sql
-- Set all old local paths to NULL
UPDATE users SET profile_pic = NULL WHERE profile_pic IS NOT NULL AND profile_pic NOT LIKE 'https://%';
UPDATE candidates SET profile_pic = NULL WHERE profile_pic IS NOT NULL AND profile_pic NOT LIKE 'https://%';
```

This clears any path that's not a full HTTPS URL (i.e., not a Cloudinary URL).

---

## What Happens After?

✅ **Old 404 errors disappear** - No more requests to `/uploads/profiles/...`  
✅ **Default avatars show** - Frontend shows placeholder images  
✅ **Users can re-upload** - New uploads go to Cloudinary  
✅ **Pictures persist forever** - Cloudinary stores them permanently  

---

## Quick Test After Running SQL:

1. Refresh your website: https://online-voting-system-mini.netlify.app/
2. Go to Vote or Results page
3. You should see default avatars (no 404 errors in console)
4. Users can now re-upload their profile pictures
5. New uploads will have Cloudinary URLs like:
   `https://res.cloudinary.com/ddrfk2eue/image/upload/...`

---

## Need Help?

If you're not sure how to access the Render database shell:
1. Go to https://dashboard.render.com/
2. Find your PostgreSQL database in the list
3. Click on it
4. Look for "Shell" or "Connect" tab
5. Copy-paste the SQL commands above

---

**Run the SQL commands and let me know when done!** ✅
