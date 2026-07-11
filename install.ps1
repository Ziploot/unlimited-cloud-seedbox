# ZipLoot Windows 1-Click Cloud Seedbox Setup
try {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "[ZipLoot] Cloud Seedbox Installer" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green

    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $projectFolder = Join-Path $pwd "unlimited-cloud-seedbox-project"
    if (Test-Path $projectFolder) {
        Write-Host "[WARN] Folder 'unlimited-cloud-seedbox-project' already exists." -ForegroundColor Yellow
    } else {
        New-Item -ItemType Directory -Path $projectFolder -ErrorAction SilentlyContinue | Out-Null
    }

    # Copy files
    Copy-Item -Path "$scriptDir\index.js" -Destination "$projectFolder\index.js" -Force
    Copy-Item -Path "$scriptDir\package.json" -Destination "$projectFolder\package.json" -Force
    Copy-Item -Path "$scriptDir\Dockerfile" -Destination "$projectFolder\Dockerfile" -Force
    Copy-Item -Path "$scriptDir\README.md" -Destination "$projectFolder\README.md" -Force

    Set-Location $projectFolder

    Write-Host "`n==============================================" -ForegroundColor Green
    Write-Host "⚡ OPTION 1: 1-Click Cloud Deployment (Hugging Face Spaces)" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "The absolute easiest way! Deploy to the cloud in 10 seconds for `$0:" -ForegroundColor Cyan
    Write-Host "1. Log into Hugging Face (or sign up for free)."
    Write-Host "2. Click this template link to duplicate the space:"
    Write-Host "   -> https://huggingface.co/spaces/Ziploot/unlimited-cloud-seedbox?duplicate=true" -ForegroundColor Green
    Write-Host "3. Set the space visibility to PRIVATE (so your downloads remain private) and click Duplicate."
    Write-Host "4. Done! Your private seedbox is active and running in the cloud!" -ForegroundColor Green

    # Automating the browser launch for duplication
    $openCloud = Read-Host "`n[INPUT] Do you want to open the 1-Click Cloud Duplication page now? (Y/N)"
    if ($openCloud -eq "Y" -or $openCloud -eq "y") {
        Start-Process "https://huggingface.co/spaces/Ziploot/unlimited-cloud-seedbox?duplicate=true"
    }

    Write-Host "`n==============================================" -ForegroundColor Green
    Write-Host "⚡ OPTION 2: Local Server Setup" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    $runLocal = Read-Host "[INPUT] Do you want to run the Seedbox server locally on your computer? (Y/N)"
    
    if ($runLocal -eq "Y" -or $runLocal -eq "y") {
        # Check Node.js
        $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
        if (-not $nodeInstalled) {
            Write-Host "[WARN] Node.js not detected. Installing NodeJS via winget..." -ForegroundColor Yellow
            winget install OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
            $env:Path += ";$env:ProgramFiles\nodejs"
        }

        Write-Host "[INSTALL] Installing local dependencies..." -ForegroundColor Cyan
        cmd.exe /c "npm install"

        Write-Host "`n[START] Launching Local Seedbox Server..." -ForegroundColor Cyan
        # Start the node server in a hidden background window (default port 7860)
        Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $projectFolder -WindowStyle Hidden
        Start-Sleep -Seconds 2

        Write-Host "`n[BROWSER] Opening Local Seedbox Dashboard..." -ForegroundColor Cyan
        Start-Process "http://localhost:7860"
        
        Write-Host "`n[SUCCESS] Local Seedbox Server is running in the background!" -ForegroundColor Green
        Write-Host "To start it manually later, run 'npm start' in: $projectFolder"
    }

    Read-Host "`nSetup completed. Press Enter to exit..."
} catch {
    Write-Host "[ERROR] An unexpected error occurred: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
}
