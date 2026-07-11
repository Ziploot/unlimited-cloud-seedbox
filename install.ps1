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
    Copy-Item -Path "$scriptDir\deploy_hf.py" -Destination "$projectFolder\deploy_hf.py" -Force
    Copy-Item -Path "$scriptDir\README.md" -Destination "$projectFolder\README.md" -Force

    Set-Location $projectFolder

    Write-Host "`n==============================================" -ForegroundColor Green
    Write-Host "⚡ OPTION 1: 1-Click Automated Cloud Deployment (Hugging Face)" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    $deployCloud = Read-Host "[INPUT] Do you want to automatically deploy this Seedbox to Hugging Face Cloud? (Y/N)"
    
    if ($deployCloud -eq "Y" -or $deployCloud -eq "y") {
        # Check Python is installed
        $pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
        if (-not $pythonInstalled) {
            Write-Host "[WARN] Python not detected. Installing Python via winget..." -ForegroundColor Yellow
            winget install Python.Python.3 --silent --accept-package-agreements --accept-source-agreements
        }
        
        Write-Host "`n[DEPLOY] Running automated Hugging Face deployer script..." -ForegroundColor Cyan
        python deploy_hf.py
        Read-Host "`nCloud Setup completed! Press Enter to exit..."
        Exit
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
