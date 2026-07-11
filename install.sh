#!/bin/bash
# ZipLoot Linux/macOS 1-Click Cloud Seedbox Setup
echo "=============================================="
echo "⚡ ZipLoot - Linux/macOS Auto-Installer ⚡"
echo "=============================================="

# Create project folder locally
PROJECT_DIR="$(pwd)/unlimited-cloud-seedbox-project"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Download files from repository
echo "📥 Fetching files..."
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/index.js" -o index.js
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/package.json" -o package.json
curl -sL "https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/Dockerfile" -o Dockerfile

echo "✅ Local files successfully configured!"
echo "Now upload these files (index.js, package.json, Dockerfile) to a new Hugging Face Space using Docker SDK to host it completely for free!"
