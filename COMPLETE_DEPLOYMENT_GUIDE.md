# 🚀 Complete Deployment Guide - Start to Finish

This is the **complete** guide from zero to deployed application. Follow in order.

---

## Part 1: GitHub Setup (Do This First!)

### ✅ Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click "+" → "New repository"
3. Name it: `island-radiology-app` (or any name)
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### ✅ Step 2: Push Your Code to GitHub

**Open Terminal** and run:

```bash
# Navigate to your project
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Island Radiology application"

# Rename branch to main
git branch -M main

# Connect to GitHub (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

**If asked for password**: Use a GitHub Personal Access Token (see `GITHUB_SETUP.md` for details)

### ✅ Step 3: Verify on GitHub

1. Go to your repository page on GitHub
2. You should see all your files (`backend/`, `frontend/`, `database/`, etc.)

---

## Part 2: Railway Deployment

### ✅ Step 4: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Login with GitHub"
4. Authorize Railway to access GitHub

### ✅ Step 5: Create Railway Project

1. Click "+ New" button
2. You'll see "What would you like to create?"
3. **Click "GitHub Repository"**
4. Select your repository from the list
5. Railway creates the project

### ✅ Step 6: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Click "Database"
3. Select "Add PostgreSQL"
4. Wait ~30 seconds for it to provision

### ✅ Step 7: Deploy Backend

1. Click "+ New" → "GitHub Repo" → Select your repo

2. **Configure Backend**:
   - Go to "Settings" tab
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Click "Save"

3. **Add Environment Variables** (Variables tab):
   - `NODE_ENV` = `production`
   - `PORT` = `5001`
   - `JWT_SECRET` = `your-random-secret-key-min-32-chars`
   - Click "Add Reference" → Select PostgreSQL (adds `DATABASE_URL`)

4. **Generate Domain**:
   - Settings → Networking → "Generate Domain"
   - Copy the URL (e.g., `https://your-backend.up.railway.app`)

### ✅ Step 8: Run Database Migrations

1. Go to PostgreSQL service → "Connect" → "Query"
2. Copy and paste contents of `database/schema.sql` → Click "Run"
3. Repeat for:
   - `database/migrations/add_users_table.sql`
   - `database/migrations/add_requisitions_table.sql`
   - `database/migrations/add_assigned_site_to_requisitions.sql`

### ✅ Step 9: Deploy Frontend

1. Click "+ New" → "GitHub Repo" → Select your repo

2. **Configure Frontend**:
   - Settings → Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

3. **Add Environment Variable**:
   - Variables tab → `VITE_API_URL` = `https://your-backend-url.railway.app/api`
   - (Use your actual backend URL from Step 7)

4. **Generate Domain**:
   - Settings → Networking → "Generate Domain"
   - Copy the URL

### ✅ Step 10: Update Backend CORS

1. Go to Backend service → Variables tab
2. Add: `FRONTEND_URL` = `https://your-frontend-url.railway.app`
3. Backend will auto-redeploy

### ✅ Step 11: Test

1. **Backend**: `https://your-backend.railway.app/api/health` → Should return `{"status":"OK"}`
2. **Frontend**: `https://your-frontend.railway.app` → Should show login page
3. **Login**: `admin@radiology.com` / `admin123`

---

## 📋 Quick Command Reference

### GitHub Setup:
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

### Environment Variables:

**Backend:**
- `NODE_ENV=production`
- `PORT=5001`
- `JWT_SECRET=<your-secret>`
- `DATABASE_URL` (auto-added)
- `FRONTEND_URL=<your-frontend-url>`

**Frontend:**
- `VITE_API_URL=<your-backend-url>/api`

---

## 🆘 Need More Details?

- **GitHub Setup**: See `GITHUB_SETUP.md`
- **Railway Details**: See `STEP_BY_STEP_DEPLOYMENT.md`
- **Quick Reference**: See `QUICK_DEPLOY.md`

---

## ✅ Final Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Backend deployed
- [ ] Database migrations run
- [ ] Frontend deployed
- [ ] CORS configured
- [ ] Application tested and working

**You're done! Your app is live! 🎉**
