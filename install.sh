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
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/Dockerfile" -o "$PROJECT_DIR/Dockerfile"
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/deploy_hf.py" -o "$PROJECT_DIR/deploy_hf.py"
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/README.md" -o "$PROJECT_DIR/README.md"

cd "$PROJECT_DIR"

echo ""
echo "=============================================="
echo "⚡ OPTION 1: 1-Click Automated Cloud Deployment (Hugging Face)"
echo "=============================================="
read -p "[INPUT] Do you want to automatically deploy this Seedbox to Hugging Face Cloud? (y/n): " DEPLOY_CLOUD

if [ "$DEPLOY_CLOUD" = "y" ] || [ "$DEPLOY_CLOUD" = "Y" ]; then
    echo -e "
[DEPLOY] Running automated Hugging Face deployer script..."
    python3 deploy_hf.py
    exit 0
fi

echo ""
echo "=============================================="
echo "⚡ OPTION 2: Local Server Setup"
echo "=============================================="
read -p "[INPUT] Do you want to run the Seedbox server locally? (y/n): " RUN_LOCAL

if [ "$RUN_LOCAL" = "y" ] || [ "$RUN_LOCAL" = "Y" ]; then
    npm install
    
    echo -e "
[START] Launching Local Seedbox Server..."
    node index.js > /dev/null 2>&1 &
    sleep 2
    
    echo -e "
[BROWSER] Opening Local Seedbox Dashboard..."
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
