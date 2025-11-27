# 📚 Step-by-Step Deployment Guide - Detailed Explanation

This guide explains each step in detail with exact instructions.

---

## STEP 1: Create PostgreSQL Database

### What This Does
Creates a PostgreSQL database on Render where all your voting system data will be stored (users, candidates, votes, etc.).

### Detailed Instructions

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com
   - Login with your **NEW** Render account credentials
   - You should see the main dashboard

2. **Start Database Creation**
   - Look for a **"New +"** button (usually in the top-right corner)
   - Click on it
   - A dropdown menu will appear

3. **Select PostgreSQL**
   - From the dropdown, click on **"PostgreSQL"**
   - You'll be taken to the database creation form

4. **Fill in Database Details**
   
   **Name Field:**
   - Enter: `voting-db`
   - This is just a label for your database in Render
   - You'll see this name in your dashboard
   
   **Database Field:**
   - Enter: `voting_system`
   - This is the actual database name inside PostgreSQL
   - Your application will connect to this database
   
   **User Field:**
   - Enter: `voting_user`
   - This is the database username
   - Your app will use this to connect
   
   **Region:**
   - Choose the region closest to you or your users
   - Common options: `Oregon (US West)`, `Frankfurt (EU)`, `Singapore (Asia)`
   - **Important:** Choose the same region for your web service later
   
   **PostgreSQL Version:**
   - Leave as default (usually 15 or latest)
   - This is fine for your application

5. **Create the Database**
   - Click the **"Create Database"** button (usually at the bottom)
   - Render will start creating your database
   - You'll see a loading/progress indicator

6. **Wait for Database to be Ready**
   - ⏳ Wait 2-3 minutes
   - The status will change from "Creating" to "Available"
   - You'll see a green checkmark or "Available" status

7. **Get the Database Connection URL**
   - Click on your database name (`voting-db`) in the dashboard
   - You'll see several tabs: **Overview**, **Info**, **Connect**, **Query**, etc.
   - Look for **"Internal Database URL"** or **"Connection String"**
   - It will look like:
     ```
     postgresql://voting_user:password123@dpg-xxxxx.oregon-postgres.render.com:5432/voting_system
     ```
   - **⚠️ IMPORTANT:** Copy this entire URL
   - **Save it somewhere safe** - you'll need it in Step 3
   - This is the `DATABASE_URL` you'll use as an environment variable

### What You Should See
- Database appears in your dashboard
- Status shows "Available" (green)
- You have the Internal Database URL copied

### Common Issues
- **"Name already taken"**: Try `voting-db-2` or add your name
- **Can't find Internal URL**: Look in the "Info" or "Connect" tab
- **Still creating after 5 minutes**: Refresh the page, it might be done

---

## STEP 2: Deploy Web Service

### What This Does
Deploys your Flask backend application to Render so it can run on the internet and handle API requests.

### Detailed Instructions

1. **Start Web Service Creation**
   - In Render Dashboard, click **"New +"** button again
   - From the dropdown, select **"Web Service"**
   - You'll see deployment options

2. **Choose Deployment Method**
   
   **Option A: If you have Git repository (GitHub/GitLab/Bitbucket)**
   - Select **"Build and deploy from a Git repository"**
   - Connect your Git account
   - Select your repository
   - Render will detect your code automatically
   
   **Option B: If you DON'T have Git (Manual)**
   - Select **"Public Git repository"** (if your repo is public)
   - OR use **"Blueprint"** method (see below)
   
   **Option C: Using Blueprint (Easiest if you have render.yaml)**
   - Click **"New +"** → **"Blueprint"**
   - Connect your Git repository
   - Render will automatically detect `render.yaml`
   - It will create both database AND web service
   - Click **"Apply"** and skip to Step 3

3. **Configure Web Service** (if not using Blueprint)

   **Basic Settings:**
   
   **Name:**
   - Enter: `voting-backend`
   - This will be part of your URL: `voting-backend-xxxx.onrender.com`
   
   **Region:**
   - **IMPORTANT:** Choose the **SAME region** as your database
   - This reduces latency and costs
   
   **Branch:**
   - Usually `main` or `master`
   - This is the Git branch to deploy from
   
   **Root Directory:**
   - Leave empty (if backend folder is in root)
   - OR enter `backend` if your code structure needs it

   **Build Settings:**
   
   **Runtime:**
   - Select **"Python 3"**
   - Render will detect Python automatically
   
   **Build Command:**
   - Enter: `pip install -r backend/requirements.txt`
   - This installs all Python dependencies
   - Render runs this during deployment
   
   **Start Command:**
   - Enter: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
   - This starts your Flask app using Gunicorn
   - `$PORT` is automatically set by Render

4. **Create the Service**
   - Click **"Create Web Service"** button
   - Render will start building your application
   - You'll see build logs in real-time

5. **Monitor the Build**
   - Watch the build logs
   - You should see:
     - Installing dependencies
     - Building application
     - Starting service
   - ⏳ First build takes 3-5 minutes
   - Status will change to "Live" when ready

6. **Get Your Backend URL**
   - Once status is "Live", you'll see a URL
   - Format: `https://voting-backend-xxxx.onrender.com`
   - **Save this URL** - you'll need it for frontend configuration

### What You Should See
- Web service appears in dashboard
- Status shows "Live" (green)
- Build logs show successful deployment
- You have your backend URL

### Common Issues
- **Build fails**: Check logs for missing dependencies
- **"Application Error"**: Usually means environment variables not set (Step 3)
- **502 Bad Gateway**: Service is still starting, wait 30 seconds

---

## STEP 3: Set Environment Variables

### What This Does
Configures your application with necessary settings like database connection, secret keys, and CORS settings. These are like configuration files that your app reads when it starts.

### Detailed Instructions

1. **Open Your Web Service**
   - In Render Dashboard, click on your web service (`voting-backend`)
   - You'll see several tabs: **Overview**, **Logs**, **Environment**, **Settings**, etc.

2. **Go to Environment Tab**
   - Click on the **"Environment"** tab
   - You'll see a list of environment variables (might be empty initially)
   - There's an **"Add Environment Variable"** button or section

3. **Add Each Environment Variable**
   
   Click **"Add"** or **"Add Environment Variable"** for each one:

   **Variable 1: FLASK_ENV**
   - **Key:** `FLASK_ENV`
   - **Value:** `production`
   - **Purpose:** Tells Flask to run in production mode
   - Click **"Save"** or **"Add"**

   **Variable 2: DEBUG**
   - **Key:** `DEBUG`
   - **Value:** `False`
   - **Purpose:** Disables debug mode (more secure)
   - Click **"Save"** or **"Add"**

   **Variable 3: PORT**
   - **Key:** `PORT`
   - **Value:** `10000`
   - **Purpose:** Port number for the application (Render sets this automatically, but we specify it)
   - Click **"Save"** or **"Add"**

   **Variable 4: DATABASE_URL** ⚠️ **MOST IMPORTANT**
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the **Internal Database URL** you copied in Step 1
     ```
     postgresql://voting_user:password@dpg-xxxxx.oregon-postgres.render.com:5432/voting_system
     ```
   - **Purpose:** Tells your app how to connect to the database
   - **⚠️ Make sure it's the INTERNAL URL, not external**
   - Click **"Save"** or **"Add"**

   **Variable 5: SECRET_KEY**
   - **Key:** `SECRET_KEY`
   - **Value:** Generate a random 32-character string
   - **How to generate (PowerShell):**
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
     ```
   - Copy the output and paste as value
   - **Purpose:** Used for session security and encryption
   - Click **"Save"** or **"Add"**

   **Variable 6: JWT_SECRET_KEY**
   - **Key:** `JWT_SECRET_KEY`
   - **Value:** Generate another random 32-character string (different from SECRET_KEY)
   - **How to generate:** Run the PowerShell command again
   - **Purpose:** Used for JWT token signing (authentication)
   - Click **"Save"** or **"Add"**

   **Variable 7: CORS_ORIGINS**
   - **Key:** `CORS_ORIGINS`
   - **Value:** `*` (asterisk)
   - **Purpose:** Allows your frontend to make API requests
   - **Note:** Later you can change this to your specific frontend URL
   - Click **"Save"** or **"Add"**

4. **Verify All Variables**
   - Check that all 7 variables are listed:
     - ✅ FLASK_ENV
     - ✅ DEBUG
     - ✅ PORT
     - ✅ DATABASE_URL
     - ✅ SECRET_KEY
     - ✅ JWT_SECRET_KEY
     - ✅ CORS_ORIGINS

5. **Service Will Auto-Redeploy**
   - After adding variables, Render automatically redeploys your service
   - You'll see "Deploying..." status
   - ⏳ Wait 1-2 minutes for redeployment
   - Check **"Logs"** tab to see if deployment succeeded

### What You Should See
- All 7 environment variables listed
- Service status shows "Live" after redeployment
- Logs show successful connection to database

### Common Issues
- **"DATABASE_URL not found"**: Make sure you copied the INTERNAL URL
- **Service won't start**: Check logs for errors, verify DATABASE_URL format
- **"Invalid secret key"**: Make sure keys are 32 characters, no spaces

### Quick Secret Key Generator
You can also use the helper script:
```powershell
cd online-voting-system
.\deploy-new-render.ps1
# Choose option 1 to generate keys
```

---

## STEP 4: Initialize Database Schema

### What This Does
Creates all the necessary tables in your database (users, candidates, votes, etc.) so your application can store and retrieve data. Think of it as creating the structure/framework for your data.

### Detailed Instructions

1. **Open Your Database in Render**
   - In Render Dashboard, click on your database (`voting-db`)
   - You'll see tabs: **Overview**, **Info**, **Connect**, **Query**, etc.

2. **Open SQL Query Editor**
   - Click on the **"Query"** tab
   - You'll see a SQL editor/textarea where you can type SQL commands
   - This is where you'll paste and run your schema

3. **Get the Database Schema File**
   - Open the file: `online-voting-system/database/voting_system.sql`
   - You can open it in any text editor (Notepad, VS Code, etc.)
   - **Select ALL** the contents (Ctrl+A)
   - **Copy** everything (Ctrl+C)
   - The file contains SQL commands to create tables

4. **Paste Schema into Query Editor**
   - Go back to Render's Query tab
   - Click in the text area
   - **Paste** the SQL schema (Ctrl+V)
   - You should see all the SQL commands:
     ```sql
     CREATE TABLE users (...)
     CREATE TABLE candidates (...)
     CREATE TABLE votes (...)
     etc.
     ```

5. **Run the Schema**
   - Look for a **"Run"** or **"Execute"** button (usually at bottom or top)
   - Click it
   - Render will execute all the SQL commands
   - ⏳ Wait 10-30 seconds

6. **Verify Success**
   - You should see a success message like:
     ```
     Database schema created successfully!
     ```
   - OR you'll see the query executed successfully
   - If there are errors, they'll be shown in red

7. **Verify Tables Were Created** (Optional)
   - In the Query tab, run this SQL:
     ```sql
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public';
     ```
   - You should see tables: `users`, `candidates`, `votes`, `results`

8. **Create Admin User**
   
   You have two options:

   **Option A: Using SQL (Quick)**
   - In the Query tab, run this SQL:
     ```sql
     INSERT INTO users (name, email, password, role, status, created_at)
     VALUES (
       'Admin',
       'admin@voting.com',
       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5q5',
       'admin',
       'active',
       NOW()
     );
     ```
   - **Note:** The password hash above is for password: `admin123`
   - Click **"Run"**
   - ✅ Admin user created!

   **Option B: Using Python Script (More Secure)**
   - This requires running the script locally with DATABASE_URL set
   - More complex, but generates proper password hash
   - See `backend/create_admin.py` for details

### What You Should See
- Success message after running schema
- Tables created: users, candidates, votes, results
- Admin user created (if you ran the INSERT)

### Common Issues
- **"Table already exists"**: This is OK if you're re-running, the schema drops tables first
- **"Permission denied"**: Make sure you're using the correct database user
- **"Syntax error"**: Check that you copied the entire SQL file correctly

### Verify Everything Works

Test your backend:
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://your-backend.onrender.com/api/health"

# Test stats (should show 0s initially, or counts if admin was created)
Invoke-WebRequest -Uri "https://your-backend.onrender.com/api/stats"
```

---

## ✅ Completion Checklist

After completing all 4 steps, verify:

- [ ] Database is "Available" in Render
- [ ] Web service is "Live" in Render
- [ ] All 7 environment variables are set
- [ ] Database schema executed successfully
- [ ] Tables exist (users, candidates, votes, results)
- [ ] Admin user created
- [ ] Health endpoint returns: `{"status": "ok"}`
- [ ] Stats endpoint returns data

---

## 🎉 You're Done!

Your backend is now fully deployed and ready to use!

**Next Steps:**
1. Update frontend API URL to point to your new backend
2. Test login with admin credentials
3. Start using your voting system!

---

## 📞 Need Help?

If you encounter issues:
1. Check the **Logs** tab in Render (for web service)
2. Check the **Query** tab for SQL errors
3. Verify all environment variables are set correctly
4. Make sure database and web service are in the same region

