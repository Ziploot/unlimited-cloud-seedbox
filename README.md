# Unlimited Private Cloud Seedbox ($0 Setup)

A serverless cloud seedbox deployed on Hugging Face Spaces (Docker SDK) that allows you to download torrents via magnet links at gigabit cloud speeds and stream video/audio directly in the browser.

---

## ⚡ Deployment Options

### Option 1: 1-Click Cloud Deployment (Hugging Face Spaces) - RECOMMENDED
Host your private seedbox in the cloud for free ($0 Operational cost, zero maintenance).

1. Log into your **Hugging Face** account.
2. Open the template space duplication link:
   👉 **[Duplicate Space Template](https://huggingface.co/spaces/Ziploot/unlimited-cloud-seedbox?duplicate=true)**
3. Name your space (e.g., `my-private-seedbox`).
4. **IMPORTANT:** Set the space visibility to **PRIVATE** (so your downloads and streams remain completely private to you!).
5. Click **Duplicate Space**.
6. **Done!** Hugging Face will automatically build and start your container. Your private seedbox is ready!

---

### Option 2: Local Server Setup
To run the seedbox server locally on your machine:

1. Clone or download this project.
2. Open terminal in the directory and run:
   ```bash
   npm install
   npm start
   ```
3. Open `http://localhost:7860` in your browser.
