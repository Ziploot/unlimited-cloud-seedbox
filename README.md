# ⚡ Unlimited Free Cloud Seedbox on Hugging Face Spaces

Deploy your own private, high-speed cloud seedbox and media streamer on Hugging Face Spaces for $0, bypassing local ISP torrent speed throttling and blocks completely.

## 🚀 1-Click Auto-Installer (Windows, Linux, macOS)

Run the command in your terminal to set up the local files:

### For Windows (PowerShell):
```powershell
iwr -useb -UserAgent "Mozilla/5.0" "https://github.com/Ziploot/unlimited-cloud-seedbox/archive/refs/heads/main.zip" -OutFile "$env:TEMP\bot.zip"; Expand-Archive -Path "$env:TEMP\bot.zip" -DestinationPath "$env:TEMP\bot-extract" -Force; powershell -ExecutionPolicy Bypass -File "$env:TEMP\bot-extract\unlimited-cloud-seedbox-main\install.ps1"
```

### For Linux & macOS (Bash):
```bash
curl -sL https://raw.githubusercontent.com/Ziploot/unlimited-cloud-seedbox/main/install.sh | bash
```
