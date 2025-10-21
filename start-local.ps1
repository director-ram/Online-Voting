# Get local IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "       🗳️  ONLINE VOTING SYSTEM - LOCAL DEPLOYMENT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if backend exists
if (-not (Test-Path "backend/app.py")) {
    Write-Host "❌ Error: Backend not found!" -ForegroundColor Red
    Write-Host "   Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

# Check if frontend exists
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ Error: Frontend not found!" -ForegroundColor Red
    Write-Host "   Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/backend'; Write-Host '🔧 BACKEND SERVER' -ForegroundColor Green; Write-Host '════════════════════════════════════' -ForegroundColor Cyan; python app.py"
Start-Sleep -Seconds 3

Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/frontend'; Write-Host '🌐 FRONTEND SERVER' -ForegroundColor Green; Write-Host '════════════════════════════════════' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ SYSTEM IS RUNNING!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Access Your App:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🖥️  On this computer:" -ForegroundColor White
Write-Host "       http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "   📲 On other devices (same WiFi):" -ForegroundColor White
Write-Host "       http://$($ip):3001" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📡 Backend API: http://localhost:5000/api" -ForegroundColor Gray
Write-Host "📊 Health Check: http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  To Stop Servers:" -ForegroundColor Yellow
Write-Host "    Press Ctrl+C in the Backend and Frontend windows" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Share the WiFi URL with others to test together!" -ForegroundColor Cyan
Write-Host ""
