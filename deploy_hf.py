import os
import subprocess
import sys

try:
    print("==============================================")
    print("[ZipLoot] Hugging Face Spaces Cloud Deployer")
    print("==============================================")
    
    # Ensure huggingface_hub is installed
    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("[INSTALL] Installing huggingface_hub dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
        from huggingface_hub import HfApi, create_repo

    print("\nTo deploy automatically, we need your Hugging Face Write Token:")
    print("👉 Get your token in 1-Click: https://huggingface.co/settings/tokens")
    token = input("[INPUT] Paste your Hugging Face Access Token: ").strip()
    
    if not token:
        print("[ERROR] Token is required for cloud deployment!")
        sys.exit(1)

    api = HfApi(token=token)
    user_info = api.whoami()
    username = user_info["name"]
    
    repo_id = f"{username}/unlimited-cloud-seedbox"
    print(f"\n[DEPLOY] Creating public Hugging Face Space: {repo_id}...")
    try:
        create_repo(repo_id=repo_id, repo_type="space", space_sdk="docker", private=False, token=token)
    except Exception as e:
        print(f"[INFO] Space already exists or initialized: {e}")

    print("\n[DEPLOY] Uploading seedbox files to the space...")
    files_to_upload = ["index.js", "package.json", "Dockerfile", "README.md"]
    for f in files_to_upload:
        if os.path.exists(f):
            api.upload_file(
                path_or_fileobj=f,
                path_in_repo=f,
                repo_id=repo_id,
                repo_type="space",
                token=token
            )
            print(f" -> Uploaded: {f}")

    space_url = f"https://huggingface.co/spaces/{repo_id}"
    print(f"\n==============================================")
    print(f"[SUCCESS] Cloud Seedbox Deployed Successfully!")
    print(f"==============================================")
    print(f"Your private dashboard: {space_url}")
    print("Please wait 1-2 minutes for Hugging Face to build the container.")
    
    import webbrowser
    webbrowser.open(space_url)

except Exception as e:
    print(f"[ERROR] Deployment failed: {e}")
