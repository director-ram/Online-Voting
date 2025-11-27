# PowerShell Script for Deploying to New Render Account
# This script helps prepare and test your deployment

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 Render Deployment Helper Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to generate random secret key
function Generate-SecretKey {
    $chars = (48..57) + (65..90) + (97..122)  # 0-9, A-Z, a-z
    $key = -join (Get-Random -InputObject $chars -Count 32 | ForEach-Object { [char]$_ })
    return $key
}

# Function to test backend endpoint
function Test-BackendEndpoint {
    param(
        [string]$Url,
        [string]$Endpoint = "/api/health"
    )
    
    try {
        $fullUrl = "$Url$Endpoint"
        Write-Host "Testing: $fullUrl" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 30 -ErrorAction Stop
        Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)`n" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main Menu
Write-Host "What would you like to do?`n" -ForegroundColor White
Write-Host "1. Generate Secret Keys (for environment variables)" -ForegroundColor Cyan
Write-Host "2. Test Backend Health Endpoint" -ForegroundColor Cyan
Write-Host "3. Test Backend Stats Endpoint" -ForegroundColor Cyan
Write-Host "4. Test Backend Candidates Endpoint" -ForegroundColor Cyan
Write-Host "5. Test All Endpoints" -ForegroundColor Cyan
Write-Host "6. Show Deployment Checklist" -ForegroundColor Cyan
Write-Host "`n0. Exit`n" -ForegroundColor Gray

$choice = Read-Host "Enter your choice (0-6)"

switch ($choice) {
    "1" {
        Write-Host "`n🔑 Generating Secret Keys...`n" -ForegroundColor Yellow
        Write-Host "SECRET_KEY:" -ForegroundColor Cyan
        $key1 = Generate-SecretKey
        Write-Host $key1 -ForegroundColor Green
        Write-Host "`nJWT_SECRET_KEY:" -ForegroundColor Cyan
        $key2 = Generate-SecretKey
        Write-Host $key2 -ForegroundColor Green
        Write-Host "`n✅ Copy these keys to your Render environment variables!`n" -ForegroundColor Yellow
    }
    
    "2" {
        $backendUrl = Read-Host "`nEnter your backend URL (e.g., https://voting-backend-xxxx.onrender.com)"
        if ($backendUrl) {
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/health"
        }
    }
    
    "3" {
        $backendUrl = Read-Host "`nEnter your backend URL (e.g., https://voting-backend-xxxx.onrender.com)"
        if ($backendUrl) {
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/stats"
        }
    }
    
    "4" {
        $backendUrl = Read-Host "`nEnter your backend URL (e.g., https://voting-backend-xxxx.onrender.com)"
        if ($backendUrl) {
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/candidates"
        }
    }
    
    "5" {
        $backendUrl = Read-Host "`nEnter your backend URL (e.g., https://voting-backend-xxxx.onrender.com)"
        if ($backendUrl) {
            Write-Host "`n🧪 Testing All Endpoints...`n" -ForegroundColor Yellow
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/health"
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/stats"
            Test-BackendEndpoint -Url $backendUrl -Endpoint "/api/candidates"
        }
    }
    
    "6" {
        Write-Host "`n📋 DEPLOYMENT CHECKLIST`n" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "[ ] Created new Render account" -ForegroundColor White
        Write-Host "[ ] Created PostgreSQL database (voting-db)" -ForegroundColor White
        Write-Host "[ ] Saved Internal Database URL" -ForegroundColor White
        Write-Host "[ ] Created web service" -ForegroundColor White
        Write-Host "[ ] Set environment variables:" -ForegroundColor White
        Write-Host "    - FLASK_ENV=production" -ForegroundColor Gray
        Write-Host "    - DEBUG=False" -ForegroundColor Gray
        Write-Host "    - PORT=10000" -ForegroundColor Gray
        Write-Host "    - DATABASE_URL=<internal-url>" -ForegroundColor Gray
        Write-Host "    - SECRET_KEY=<generated>" -ForegroundColor Gray
        Write-Host "    - JWT_SECRET_KEY=<generated>" -ForegroundColor Gray
        Write-Host "    - CORS_ORIGINS=*" -ForegroundColor Gray
        Write-Host "[ ] Deployed backend" -ForegroundColor White
        Write-Host "[ ] Initialized database schema" -ForegroundColor White
        Write-Host "[ ] Created admin user" -ForegroundColor White
        Write-Host "[ ] Tested health endpoint" -ForegroundColor White
        Write-Host "[ ] Tested API endpoints" -ForegroundColor White
        Write-Host "[ ] Updated frontend API URL" -ForegroundColor White
        Write-Host "[ ] Updated CORS settings" -ForegroundColor White
        Write-Host "`n" -ForegroundColor White
    }
    
    "0" {
        Write-Host "`n👋 Goodbye!`n" -ForegroundColor Cyan
        exit
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please try again.`n" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

