@echo off
echo ========================================================
echo CIVICVISION AI - GitHub Automatic Push Script (Force Sync)
echo Repository: https://github.com/shriyanshdashore/civicvision-ai.git
echo ========================================================

cd /d "C:\Users\shriy\.gemini\antigravity\scratch\civicvision-ai"

git init
git add .
git commit -m "CIVICVISION AI - Indore Public Infrastructure Command Center"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/shriyanshdashore/civicvision-ai.git
git push -u origin main --force

echo ========================================================
echo Upload complete! Check your repository at:
echo https://github.com/shriyanshdashore/civicvision-ai
echo ========================================================
pause
