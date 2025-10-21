# Quick Local Network Deployment Script
# This script prepares the voting system for local network access

Write-Host "`n🚀 LOCAL NETWORK DEPLOYMENT SETUP`n" -ForegroundColor Cyan

# Step 1: Get IP Address
Write-Host "📍 Step 1: Getting your network IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "   ✅ Your IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Could not detect IP. Run 'ipconfig' manually" -ForegroundColor Yellow
    $ipAddress = Read-Host "   Enter your IPv4 address"
}

# Step 2: Build Frontend
Write-Host "`n📦 Step 2: Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend

if (Test-Path "node_modules") {
    Write-Host "   Building..." -ForegroundColor Gray
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Build failed. Check errors above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   Installing dependencies first..." -ForegroundColor Gray
    npm install
    npm run build
}

Set-Location ..

# Step 3: Check Backend Dependencies
Write-Host "`n🐍 Step 3: Checking backend dependencies..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "   ✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

# Activate and check packages
& "venv\Scripts\Activate.ps1"
$flaskInstalled = pip list | Select-String "Flask"
if (-not $flaskInstalled) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    pip install -r requirements.txt
}
Write-Host "   ✅ Dependencies ready" -ForegroundColor Green

Set-Location ..

# Step 4: Check Database
Write-Host "`n🗄️  Step 4: Checking database..." -ForegroundColor Yellow
$postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($postgresService -and $postgresService.Status -eq "Running") {
    Write-Host "   ✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL not detected" -ForegroundColor Yellow
    Write-Host "   Please start PostgreSQL before continuing" -ForegroundColor Yellow
    $continue = Read-Host "   Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

# Step 5: Display Access Instructions
Write-Host "`n✅ DEPLOYMENT READY!`n" -ForegroundColor Green

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  ACCESS YOUR VOTING SYSTEM" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nFrom THIS Computer:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White

Write-Host "`nFrom OTHER Devices (Same WiFi):" -ForegroundColor Green
Write-Host "  Frontend: http://$ipAddress:3001" -ForegroundColor White
Write-Host "  Backend:  http://$ipAddress:5000" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Step 6: Start Servers
Write-Host "🚀 Starting servers...`n" -ForegroundColor Yellow

Write-Host "Choose how to start:" -ForegroundColor Cyan
Write-Host "  1. Start automatically (opens 2 new windows)" -ForegroundColor White
Write-Host "  2. Manual start (I'll start them myself)" -ForegroundColor White
$choice = Read-Host "`nYour choice (1 or 2)"

if ($choice -eq "1") {
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\backend'; .\venv\Scripts\Activate.ps1; python app.py"
    
    Start-Sleep -Seconds 2
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\frontend'; npm run dev -- --host"
    
    Write-Host "`n✅ Servers started in separate windows!" -ForegroundColor Green
    Write-Host "   Wait 10 seconds, then access: http://$ipAddress:3001" -ForegroundColor Yellow
} else {
    Write-Host "`nManual Start Commands:" -ForegroundColor Yellow
    Write-Host "`nTerminal 1 (Backend):" -ForegroundColor Cyan
    Write-Host "  Set-Location backend" -ForegroundColor White
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  python app.py" -ForegroundColor White
    
    Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Cyan
    Write-Host "  Set-Location frontend" -ForegroundColor White
    Write-Host "  npm run dev -- --host" -ForegroundColor White
}

Write-Host "`n📱 MOBILE ACCESS:" -ForegroundColor Cyan
Write-Host "   1. Connect phone to same WiFi" -ForegroundColor White
Write-Host "   2. Open browser" -ForegroundColor White
Write-Host "   3. Go to: http://$ipAddress:3001" -ForegroundColor White

Write-Host "`n🔒 DEFAULT CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   Admin Email: admin@voting.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host "`n⚠️  FIREWALL:" -ForegroundColor Yellow
Write-Host "   If you can't access from other devices, check Windows Firewall" -ForegroundColor White
Write-Host "   Allow ports 3001 and 5000 for Node.js and Python" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
