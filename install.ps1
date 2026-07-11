# ZipLoot Windows 1-Click Cloud Seedbox Setup
try {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "[ZipLoot] Cloud Seedbox Installer" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green

    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

    # Create project folder locally in the user's CURRENT directory
    $projectFolder = Join-Path $pwd "unlimited-cloud-seedbox-project"
    if (Test-Path $projectFolder) {
        Write-Host "[WARN] Folder 'unlimited-cloud-seedbox-project' already exists." -ForegroundColor Yellow
    } else {
        New-Item -ItemType Directory -Path $projectFolder -ErrorAction SilentlyContinue | Out-Null
    }

    # Copy template files
    Copy-Item -Path "$scriptDir\\index.js" -Destination "$projectFolder\\index.js" -Force
    Copy-Item -Path "$scriptDir\\package.json" -Destination "$projectFolder\\package.json" -Force
    Copy-Item -Path "$scriptDir\\Dockerfile" -Destination "$projectFolder\\Dockerfile" -Force

    Write-Host "[SUCCESS] Local files generated!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    Write-Host "To host this on Hugging Face Spaces for free:" -ForegroundColor Yellow
    Write-Host "1. Create a free account on Hugging Face." -ForegroundColor Yellow
    Write-Host "2. Click 'Create New Space' -> Select 'Docker' SDK -> Choose 'Blank' template." -ForegroundColor Yellow
    Write-Host "3. Upload the generated files (index.js, package.json, Dockerfile) directly into the space." -ForegroundColor Yellow
    Write-Host "4. Hugging Face will automatically build and deploy it for $0!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    
    Read-Host "`nSetup completed. Press Enter to exit..."
} catch {
    Write-Host "[ERROR] An unexpected error occurred: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
}
