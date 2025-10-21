# Quick Cloud Deployment Guide (Railway + Netlify)

Write-Host "`n☁️  CLOUD DEPLOYMENT GUIDE`n" -ForegroundColor Cyan

Write-Host "This script will guide you through deploying to Railway (backend) + Netlify (frontend)`n" -ForegroundColor Yellow

# Step 1: Prerequisites Check
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  PREREQUISITES CHECK" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n✅ Git Version:" -ForegroundColor Green
git --version

Write-Host "`n📋 Account Requirements:" -ForegroundColor Yellow
Write-Host "  ☐ GitHub account (free)" -ForegroundColor White
Write-Host "  ☐ Railway account - https://railway.app (free $5 credit)" -ForegroundColor White
Write-Host "  ☐ Netlify account - https://netlify.com (free tier)" -ForegroundColor White

$continue = Read-Host "`nDo you have all accounts ready? (y/n)"
if ($continue -ne "y") {
    Write-Host "`nPlease create accounts first, then run this script again." -ForegroundColor Yellow
    exit 0
}

# Step 2: GitHub Setup
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 1: GITHUB SETUP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nYour code needs to be on GitHub for deployment." -ForegroundColor White

$gitStatus = git status 2>&1
if ($gitStatus -like "*not a git repository*") {
    Write-Host "`n❌ This folder is not a Git repository yet." -ForegroundColor Red
    $initGit = Read-Host "Initialize Git now? (y/n)"
    
    if ($initGit -eq "y") {
        git init
        git add .
        git commit -m "Initial commit for deployment"
        Write-Host "   ✅ Git initialized" -ForegroundColor Green
        
        Write-Host "`nNow create a GitHub repository:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://github.com/new" -ForegroundColor White
        Write-Host "  2. Name: online-voting-system" -ForegroundColor White
        Write-Host "  3. Keep it Private" -ForegroundColor White
        Write-Host "  4. Don't initialize with README" -ForegroundColor White
        Write-Host "  5. Click 'Create repository'" -ForegroundColor White
        
        $repoUrl = Read-Host "`nEnter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        
        Write-Host "   ✅ Code pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "`nPlease initialize Git and push to GitHub, then run this script again." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "   ✅ Git repository detected" -ForegroundColor Green
    $remoteUrl = git remote get-url origin 2>&1
    if ($remoteUrl) {
        Write-Host "   Repository: $remoteUrl" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  No remote origin found. Add GitHub remote manually." -ForegroundColor Yellow
    }
}

# Step 3: Railway Backend Deployment
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 2: RAILWAY BACKEND DEPLOYMENT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "  1. Go to https://railway.app" -ForegroundColor White
Write-Host "  2. Click 'Start a New Project'" -ForegroundColor White
Write-Host "  3. Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "  4. Choose 'online-voting-system'" -ForegroundColor White
Write-Host "  5. Add PostgreSQL database:" -ForegroundColor White
Write-Host "     - Click '+ New' → 'Database' → 'PostgreSQL'" -ForegroundColor Gray
Write-Host "  6. Configure backend service:" -ForegroundColor White
Write-Host "     - Root Directory: /backend" -ForegroundColor Gray
Write-Host "     - Start Command: python app.py" -ForegroundColor Gray
Write-Host "     - Add environment variables (see below)" -ForegroundColor Gray

Write-Host "`n🔑 Environment Variables to Add:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "SECRET_KEY=`${{ secrets.RANDOM_SECRET_KEY }}" -ForegroundColor White
Write-Host "JWT_SECRET_KEY=`${{ secrets.RANDOM_JWT_KEY }}" -ForegroundColor White
Write-Host "DATABASE_URL=`${{ POSTGRES.DATABASE_URL }}" -ForegroundColor White
Write-Host "FLASK_ENV=production" -ForegroundColor White
Write-Host "DEBUG=False" -ForegroundColor White
Write-Host "PORT=5000" -ForegroundColor White
Write-Host "CORS_ORIGINS=https://your-app.netlify.app" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`nIMPORTANT: Copy your Railway backend URL" -ForegroundColor Yellow
Write-Host "(e.g., https://your-app.railway.app)" -ForegroundColor Gray
$railwayUrl = Read-Host "Enter your Railway backend URL (or press Enter to skip for now)"

# Step 4: Database Setup
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 3: DATABASE SETUP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "  1. In Railway, click on your PostgreSQL database" -ForegroundColor White
Write-Host "  2. Go to 'Connect' tab" -ForegroundColor White
Write-Host "  3. Copy the connection details" -ForegroundColor White
Write-Host "  4. Connect using TablePlus/pgAdmin/psql" -ForegroundColor White
Write-Host "  5. Run the schema file:" -ForegroundColor White
Write-Host "     - Open: database/voting_system.sql" -ForegroundColor Gray
Write-Host "     - Execute all queries" -ForegroundColor Gray
Write-Host "  6. Create admin user:" -ForegroundColor White
Write-Host "     - Run: python create_admin.py" -ForegroundColor Gray

Write-Host "`nOr use Railway CLI to run schema:" -ForegroundColor Yellow
Write-Host "  railway login" -ForegroundColor White
Write-Host "  railway link" -ForegroundColor White
Write-Host "  railway run python backend/init_db.py" -ForegroundColor White
Write-Host "  railway run python backend/create_admin.py" -ForegroundColor White

# Step 5: Frontend Build
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 4: FRONTEND BUILD" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nUpdate API URL first:" -ForegroundColor Yellow
Write-Host "  1. Open: frontend/src/config/api.js" -ForegroundColor White
Write-Host "  2. Change API_BASE_URL to your Railway URL" -ForegroundColor White

if ($railwayUrl) {
    Write-Host "`n   const API_BASE_URL = '$railwayUrl';" -ForegroundColor Gray
}

$updateApi = Read-Host "Have you updated the API URL? (y/n)"

if ($updateApi -eq "y") {
    Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
    Set-Location frontend
    
    if (!(Test-Path "node_modules")) {
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        npm install
    }
    
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Build failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
} else {
    Write-Host "`nPlease update the API URL first, then build with: npm run build" -ForegroundColor Yellow
}

# Step 6: Netlify Deployment
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 5: NETLIFY FRONTEND DEPLOYMENT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "  1. Go to https://app.netlify.com" -ForegroundColor White
Write-Host "  2. Click 'Add new site' → 'Import existing project'" -ForegroundColor White
Write-Host "  3. Connect to GitHub → Select 'online-voting-system'" -ForegroundColor White
Write-Host "  4. Configure build settings:" -ForegroundColor White
Write-Host "     - Base directory: frontend" -ForegroundColor Gray
Write-Host "     - Build command: npm run build" -ForegroundColor Gray
Write-Host "     - Publish directory: frontend/dist" -ForegroundColor Gray
Write-Host "  5. Click 'Deploy site'" -ForegroundColor White
Write-Host "  6. After deployment, copy the Netlify URL" -ForegroundColor White
Write-Host "  7. Go back to Railway → Update CORS_ORIGINS with Netlify URL" -ForegroundColor White

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  POST-DEPLOYMENT CHECKLIST" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n☐ Update Railway CORS_ORIGINS with Netlify URL" -ForegroundColor White
Write-Host "☐ Test login with admin credentials" -ForegroundColor White
Write-Host "☐ Create test candidates" -ForegroundColor White
Write-Host "☐ Test voting flow" -ForegroundColor White
Write-Host "☐ Check error logs in Railway dashboard" -ForegroundColor White
Write-Host "☐ Monitor database usage" -ForegroundColor White

Write-Host "`n🔗 YOUR LIVE URLS:" -ForegroundColor Cyan
if ($railwayUrl) {
    Write-Host "  Backend:  $railwayUrl" -ForegroundColor White
}
Write-Host "  Frontend: https://your-app.netlify.app" -ForegroundColor White

Write-Host "`n🔒 DEFAULT ADMIN LOGIN:" -ForegroundColor Cyan
Write-Host "  Email: admin@voting.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  ⚠️  Change these in production!" -ForegroundColor Yellow

Write-Host "`n📚 Need help? Check DEPLOYMENT-GUIDE.md for detailed instructions`n" -ForegroundColor Gray

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
