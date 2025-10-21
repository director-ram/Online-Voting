# Quick ngrok Deployment Script
# Creates temporary public URL for testing/demos

Write-Host "`n🌐 NGROK TUNNEL DEPLOYMENT`n" -ForegroundColor Cyan

Write-Host "This creates a temporary public URL for your voting system." -ForegroundColor Yellow
Write-Host "Perfect for demos, testing, or showing to others quickly.`n" -ForegroundColor Yellow

# Step 1: Check ngrok installation
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 1: NGROK SETUP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if ($ngrokInstalled) {
    Write-Host "`n✅ ngrok is installed" -ForegroundColor Green
} else {
    Write-Host "`n❌ ngrok not found" -ForegroundColor Red
    Write-Host "`nInstallation options:" -ForegroundColor Yellow
    Write-Host "  1. Using Chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "  2. Download from: https://ngrok.com/download" -ForegroundColor White
    
    $hasChoco = Get-Command choco -ErrorAction SilentlyContinue
    if ($hasChoco) {
        $install = Read-Host "`nInstall ngrok with Chocolatey now? (y/n)"
        if ($install -eq "y") {
            choco install ngrok -y
            Write-Host "   ✅ ngrok installed" -ForegroundColor Green
        } else {
            Write-Host "`nPlease install ngrok manually, then run this script again." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "`nPlease install ngrok from https://ngrok.com/download" -ForegroundColor Yellow
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Step 2: ngrok Account
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 2: NGROK ACCOUNT" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nngrok requires a free account for authentication." -ForegroundColor White
Write-Host "  1. Go to https://dashboard.ngrok.com/signup" -ForegroundColor Gray
Write-Host "  2. Sign up (free)" -ForegroundColor Gray
Write-Host "  3. Get your authtoken from dashboard" -ForegroundColor Gray
Write-Host "  4. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Gray

$hasAuth = Read-Host "`nHave you configured your authtoken? (y/n)"
if ($hasAuth -ne "y") {
    Write-Host "`nPlease sign up and configure authtoken first." -ForegroundColor Yellow
    Start-Process "https://dashboard.ngrok.com/signup"
    exit 0
}

# Step 3: Start Backend
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 3: START BACKEND" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nStarting backend server on port 5000..." -ForegroundColor Yellow

# Check if backend is already running
$backendRunning = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($backendRunning) {
    Write-Host "   ⚠️  Port 5000 is already in use" -ForegroundColor Yellow
    $kill = Read-Host "Kill existing process and restart? (y/n)"
    if ($kill -eq "y") {
        Stop-Process -Id $backendRunning.OwningProcess -Force
        Start-Sleep -Seconds 2
    }
}

# Start backend in background
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\backend'; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; python app.py" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 5

# Check if backend started
$backendCheck = Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue

if ($backendCheck.TcpTestSucceeded) {
    Write-Host "   ✅ Backend running on http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend failed to start" -ForegroundColor Red
    Write-Host "   Check the backend window for errors" -ForegroundColor Yellow
    exit 1
}

# Step 4: Create ngrok Tunnel
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 4: CREATE NGROK TUNNEL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nCreating public tunnel to backend..." -ForegroundColor Yellow

# Start ngrok
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5000 --log=stdout" -WindowStyle Normal

Write-Host "`n⏳ Waiting for ngrok to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Get ngrok URL from API
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $publicUrl = $ngrokApi.tunnels[0].public_url
    
    if ($publicUrl) {
        Write-Host "   ✅ Tunnel created: $publicUrl" -ForegroundColor Green
    } else {
        throw "No URL found"
    }
} catch {
    Write-Host "   ⚠️  Could not auto-detect URL" -ForegroundColor Yellow
    Write-Host "   Check the ngrok window for your public URL" -ForegroundColor Gray
    $publicUrl = Read-Host "`nEnter your ngrok URL (e.g., https://abc123.ngrok.io)"
}

# Step 5: Update Frontend Config
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 5: UPDATE FRONTEND CONFIG" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nUpdating API URL in frontend..." -ForegroundColor Yellow

$apiConfigPath = "frontend\src\config\api.js"
if (Test-Path $apiConfigPath) {
    $apiConfig = Get-Content $apiConfigPath -Raw
    $newConfig = $apiConfig -replace "const API_BASE_URL = [^;]+;", "const API_BASE_URL = '$publicUrl';"
    Set-Content $apiConfigPath -Value $newConfig
    Write-Host "   ✅ API URL updated to: $publicUrl" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Could not find api.js" -ForegroundColor Yellow
    Write-Host "   Manually update: frontend/src/config/api.js" -ForegroundColor Gray
    Write-Host "   Set API_BASE_URL = '$publicUrl'" -ForegroundColor Gray
}

# Step 6: Start Frontend
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 6: START FRONTEND" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nStarting frontend development server..." -ForegroundColor Yellow
Write-Host "   (This will open in a new window)" -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\frontend'; npm run dev"

Start-Sleep -Seconds 5

Write-Host "   ✅ Frontend starting..." -ForegroundColor Green

# Step 7: Success Message
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🌐 ACCESS YOUR VOTING SYSTEM:`n" -ForegroundColor Yellow

Write-Host "Local Access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White

Write-Host "`nPublic Access (Anyone on Internet):" -ForegroundColor Cyan
Write-Host "  Backend:  $publicUrl" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3001 (still local)" -ForegroundColor Gray

Write-Host "`n⚠️  IMPORTANT NOTES:`n" -ForegroundColor Yellow
Write-Host "  • Frontend is still local (only you can access)" -ForegroundColor White
Write-Host "  • Backend is public (APIs accessible to anyone)" -ForegroundColor White
Write-Host "  • ngrok URL changes when you restart" -ForegroundColor White
Write-Host "  • Free tier has 2-hour session limit" -ForegroundColor White
Write-Host "  • Upgrade to ngrok Pro for static URLs" -ForegroundColor White

Write-Host "`n🔗 USEFUL LINKS:`n" -ForegroundColor Cyan
Write-Host "  ngrok Dashboard: http://localhost:4040" -ForegroundColor White
Write-Host "  (View requests, traffic, replays)" -ForegroundColor Gray

Write-Host "`n🔒 DEFAULT CREDENTIALS:`n" -ForegroundColor Cyan
Write-Host "  Admin Email: admin@voting.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

Write-Host "`n📝 TO MAKE FRONTEND PUBLIC TOO:`n" -ForegroundColor Yellow
Write-Host "  Option 1: Deploy frontend to Netlify" -ForegroundColor White
Write-Host "            (See deploy-cloud.ps1)" -ForegroundColor Gray
Write-Host "  Option 2: Create another ngrok tunnel:" -ForegroundColor White
Write-Host "            ngrok http 3001" -ForegroundColor Gray

Write-Host "`n🛑 TO STOP:`n" -ForegroundColor Red
Write-Host "  Close all opened terminal windows" -ForegroundColor White
Write-Host "  Or press Ctrl+C in each window" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
