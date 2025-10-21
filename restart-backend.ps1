# Restart Backend Server Script

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 RESTARTING BACKEND SERVER" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Kill any existing Python processes on port 5000
Write-Host "🛑 Stopping existing backend..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($proc in $processes) {
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        Write-Host "   Killed process: $proc" -ForegroundColor Gray
    }
    Write-Host "✅ Stopped old backend`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No existing backend found`n" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Start new backend
Write-Host "🚀 Starting new backend server...`n" -ForegroundColor Green
cd backend
python app.py
