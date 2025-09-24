# 🚀 Soccer Timer App - Quick Deployment Guide

## Your app is ready! Here's how to get it live in 5 minutes:

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `soccer-timer`
3. Make it **Public**
4. **Don't** check "Add a README file"
5. Click **"Create repository"**

### Step 2: Push Your Code
Copy and paste these commands in your terminal (replace YOUR_USERNAME with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/soccer-timer.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Netlify
1. Go to https://netlify.com
2. Sign in with GitHub
3. Click **"New site from Git"**
4. Choose **"GitHub"**
5. Select your `soccer-timer` repository
6. Click **"Deploy site"**

### Step 4: You're Live! 🎉
Your soccer timer app will be live at: `https://your-site-name.netlify.app`

## Future Updates
To update your app:
```bash
git add .
git commit -m "Updated app"
git push
```
Netlify will automatically deploy the changes!

## Files in Your App
- `index.html` - Main app structure
- `styles.css` - Beautiful styling
- `script.js` - All functionality including local storage
