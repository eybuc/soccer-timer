@echo off
echo.
echo ⚽ Soccer Timer App - Deployment Helper
echo =====================================
echo.

echo Step 1: Create GitHub Repository
echo --------------------------------
echo 1. Go to https://github.com/new
echo 2. Repository name: soccer-timer
echo 3. Make it Public
echo 4. Don't check "Add a README file"
echo 5. Click "Create repository"
echo.

pause

echo Step 2: Enter your GitHub username
echo ----------------------------------
set /p username="Enter your GitHub username: "

echo.
echo Adding remote repository...
git remote add origin https://github.com/%username%/soccer-timer.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo Step 3: Deploy to Netlify
echo -------------------------
echo 1. Go to https://netlify.com
echo 2. Sign in with GitHub
echo 3. Click "New site from Git"
echo 4. Choose "GitHub"
echo 5. Select your soccer-timer repository
echo 6. Click "Deploy site"
echo.

echo Your app will be live at: https://your-site-name.netlify.app
echo.
pause
