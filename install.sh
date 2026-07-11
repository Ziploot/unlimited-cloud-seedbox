#!/bin/bash
# ZipLoot Linux/macOS 1-Click Cloud Seedbox Setup
echo "=============================================="
echo "[ZipLoot] Cloud Seedbox Installer"
echo "=============================================="

PROJECT_DIR="unlimited-cloud-seedbox-project"
mkdir -p "$PROJECT_DIR"

# Download files
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/index.js" -o "$PROJECT_DIR/index.js"
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/package.json" -o "$PROJECT_DIR/package.json"
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/render.yaml" -o "$PROJECT_DIR/render.yaml"
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/README.md" -o "$PROJECT_DIR/README.md"

cd "$PROJECT_DIR"

echo ""
echo "=============================================="
echo "⚡ OPTION 1: 1-Click Cloud Deployment (Render - $0 Free Hosting)"
echo "=============================================="
echo "Deploy to the cloud in 10 seconds for $0:"
echo "1. Log into Render."
echo "2. The installer will open the 1-Click deploy page."
echo "3. Click 'Create Web Service' and you are live!"
echo ""

read -p "[INPUT] Do you want to open the 1-Click Render Deployment page now? (y/n): " OPEN_CLOUD
if [ "$OPEN_CLOUD" = "y" ] || [ "$OPEN_CLOUD" = "Y" ]; then
    if command -v xdg-open > /dev/null; then
        xdg-open "https://render.com/deploy?repo=https://github.com/Ziploot/unlimited-cloud-seedbox"
    elif command -v open > /dev/null; then
        open "https://render.com/deploy?repo=https://github.com/Ziploot/unlimited-cloud-seedbox"
    fi
fi

echo ""
echo "=============================================="
echo "⚡ OPTION 2: Local Server Setup"
echo "=============================================="
read -p "[INPUT] Do you want to run the Seedbox server locally? (y/n): " RUN_LOCAL

if [ "$RUN_LOCAL" = "y" ] || [ "$RUN_LOCAL" = "Y" ]; then
    npm install
    
    echo -e "\n[START] Launching Local Seedbox Server..."
    node index.js > /dev/null 2>&1 &
    sleep 2
    
    echo -e "\n[BROWSER] Opening Local Seedbox Dashboard..."
    if command -v xdg-open > /dev/null; then
        xdg-open "http://localhost:7860"
    elif command -v open > /dev/null; then
        open "http://localhost:7860"
    fi
    
    echo ""
    echo "[SUCCESS] Local Seedbox Server running in the background!"
    echo "To start it manually later, run 'npm start' in: $PROJECT_DIR"
fi
echo ""
