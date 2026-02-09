# 📦 Step 1: Set Up GitHub Repository (BEFORE Railway)

**IMPORTANT**: You need to push your code to GitHub FIRST before you can deploy to Railway.

---

## Step 1A: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Sign in** to your GitHub account (or create one if you don't have it)
3. **Click** the "+" icon in the top right corner
4. **Select** "New repository"
5. **Fill in**:
   - **Repository name**: `island-radiology-app` (or any name you like)
   - **Description**: "Island Radiology Queue Management System" (optional)
   - **Visibility**: Choose "Public" or "Private" (Private is fine)
   - **DO NOT** check "Initialize with README" (we already have code)
6. **Click** "Create repository"

✅ **Checkpoint**: You should see a page with instructions like "Quick setup — if you've done this kind of thing before"

---

## Step 1B: Initialize Git in Your Project

**Open Terminal** (or Command Prompt) and run these commands:

### 1. Navigate to your project folder:
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"
```

### 2. Initialize Git repository:
```bash
git init
```

### 3. Add all your files:
```bash
git add .
```

### 4. Create your first commit:
```bash
git commit -m "Initial commit - Island Radiology application"
```

### 5. Rename branch to main (if needed):
```bash
git branch -M main
```

### 6. Connect to GitHub (replace YOUR_USERNAME and REPO_NAME):
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**Example**: If your GitHub username is `kaveh` and repo name is `island-radiology-app`:
```bash
git remote add origin https://github.com/kaveh/island-radiology-app.git
```

### 7. Push to GitHub:
```bash
git push -u origin main
```

**If prompted for credentials**:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)
  - See "How to Create Personal Access Token" below

✅ **Checkpoint**: Go to your GitHub repository page - you should see all your files!

---

## How to Create Personal Access Token (if needed)

If Git asks for a password, you need a Personal Access Token:

1. **Go to GitHub** → Click your profile picture (top right)
2. **Click** "Settings"
3. **Scroll down** → Click "Developer settings" (left sidebar)
4. **Click** "Personal access tokens" → "Tokens (classic)"
5. **Click** "Generate new token" → "Generate new token (classic)"
6. **Fill in**:
   - **Note**: "Railway Deployment" (or any name)
   - **Expiration**: Choose how long (90 days is good)
   - **Scopes**: Check "repo" (this gives full repository access)
7. **Click** "Generate token"
8. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
9. **Use this token** as your password when Git asks

---

## Step 1C: Verify Everything is Pushed

1. **Go to** your GitHub repository page
2. **You should see**:
   - `backend/` folder
   - `frontend/` folder
   - `database/` folder
   - `README.md`
   - All other project files

✅ **Checkpoint**: All your code is visible on GitHub

---

## 🎯 Next Steps

Once your code is on GitHub, you can proceed to Railway deployment:

1. **Go to**: `STEP_BY_STEP_DEPLOYMENT.md`
2. **Start from**: Step 1 (Create Railway Account)
3. **When you get to Step 2**, Railway will be able to see your GitHub repository!

---

## 🆘 Troubleshooting

### "fatal: not a git repository"
- Make sure you're in the project folder
- Run `git init` first

### "remote origin already exists"
- Run: `git remote remove origin`
- Then run: `git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git`

### "Permission denied" or "Authentication failed"
- Use Personal Access Token instead of password
- Make sure token has "repo" scope

### "Everything up-to-date" but files aren't on GitHub
- Make sure you ran `git add .` and `git commit -m "message"`
- Check you're pushing to the correct repository

---

## ✅ Checklist

- [ ] GitHub account created
- [ ] GitHub repository created
- [ ] Git initialized in project (`git init`)
- [ ] Files added (`git add .`)
- [ ] First commit created (`git commit`)
- [ ] Connected to GitHub (`git remote add origin`)
- [ ] Code pushed to GitHub (`git push`)
- [ ] Verified files are on GitHub website

**Once all checked, you're ready for Railway deployment!** 🚀
