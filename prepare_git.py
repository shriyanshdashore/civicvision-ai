import subprocess
import os
import sys

project_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(project_dir)

print("CIVICVISION AI - Preparing Git Repository...")

# 1. Check if git is available
def find_git():
    try:
        subprocess.run(["git", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return "git"
    except Exception:
        pass
    
    # Common Windows Git paths
    git_paths = [
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files\Git\bin\git.exe",
        os.path.expanduser(r"~\AppData\Local\Programs\Git\cmd\git.exe")
    ]
    for path in git_paths:
        if os.path.exists(path):
            return path
    return None

git_cmd = find_git()

if not git_cmd:
    print("\n[!] Git installation not found on system PATH.")
    print("Please install Git from https://git-scm.com/download/win or use VS Code 'Publish to GitHub'.")
    sys.exit(1)

print(f"[✓] Found Git executable: {git_cmd}")

# 2. Init git if not initialized
if not os.path.exists(os.path.join(project_dir, ".git")):
    subprocess.run([git_cmd, "init"], check=True)
    print("[✓] Initialized Git repository.")

# 3. Add and Commit
subprocess.run([git_cmd, "add", "."], check=True)
subprocess.run([git_cmd, "commit", "-m", "Initial Commit: CIVICVISION AI - Indore Public Infrastructure Command Center"], check=True)
subprocess.run([git_cmd, "branch", "-M", "main"], check=True)

print("\n🎉 Local Git Repository successfully initialized and committed!")
print("To push to your GitHub account:")
print("1. Go to https://github.com/new and create a repo named 'civicvision-ai'")
print("2. Run command:")
print("   git remote add origin https://github.com/YOUR_USERNAME/civicvision-ai.git")
print("   git push -u origin main")
