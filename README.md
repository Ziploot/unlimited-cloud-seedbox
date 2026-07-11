# Unlimited Private Cloud Seedbox ($0 Setup)

A serverless cloud seedbox deployed on Render (Free Tier) that allows you to download torrents via magnet links at gigabit cloud speeds and stream video/audio directly in the browser.

---

## ⚡ Deployment Options

### Option 1: 1-Click Cloud Deployment (Render) - RECOMMENDED
Host your private seedbox in the cloud for free ($0 Operational cost, zero maintenance).

1. Log into your **Render** account.
2. Click the 1-Click deploy link:
   👉 **[Deploy to Render](https://render.com/deploy?repo=https://github.com/Ziploot/unlimited-cloud-seedbox)**
3. Name your service (e.g., `unlimited-cloud-seedbox`) and click **Create Web Service**.
4. **Done!** Render will automatically build and start your container. Your private seedbox is ready!

---

### Option 2: Local Server Setup
To run the seedbox server locally on your machine:

1. Clone or download this project.
2. Open terminal in the directory and run:
   ```bash
   npm install
   npm start
   ```
3. Open `http://localhost:3000` in your browser.
