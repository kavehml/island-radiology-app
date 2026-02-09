# 🚀 Railway Next Steps - Copy & Paste Guide

Your backend is online! Here's exactly what to do next, with copy-paste ready text.

---

## Step 1: Add PostgreSQL Database

**You need to do this in Railway:**
1. Click "+ New" or "+ Create" button
2. Click "Database"
3. Click "Add PostgreSQL"
4. Wait ~30 seconds

**I cannot do this for you** - you need to click in Railway's interface.

---

## Step 2: Connect Database to Backend

**You need to do this in Railway:**
1. Click on `island-radiology-app` service
2. Go to "Variables" tab
3. Click "New Variable" → "Add Reference"
4. Select your PostgreSQL database
5. This adds `DATABASE_URL` automatically

**I cannot do this for you** - you need to click in Railway's interface.

---

## Step 3: Add Environment Variables

**Go to Variables tab** and add these one by one:

### Variable 1:
- **Name:** `NODE_ENV`
- **Value:** `production`

### Variable 2:
- **Name:** `PORT`
- **Value:** `5001`

### Variable 3:
- **Name:** `JWT_SECRET`
- **Value:** `island-radiology-secret-key-2024-production-min-32-chars`
  - ⚠️ Change this to your own random string in production!

**I cannot add these for you** - you need to type them in Railway's interface.

---

## Step 4: Generate Backend Domain

**You need to do this in Railway:**
1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. **Copy the URL** - you'll need it for frontend!

**I cannot do this for you** - you need to click in Railway's interface.

---

## Step 5: Run Database Migrations

**I've prepared the SQL files for you to copy-paste:**

### Migration 1: schema.sql
Open: `database/schema.sql` - Copy ALL contents and paste into Railway's Query editor

### Migration 2: add_users_table.sql
Open: `database/migrations/add_users_table.sql` - Copy ALL contents and paste

### Migration 3: add_requisitions_table.sql
Open: `database/migrations/add_requisitions_table.sql` - Copy ALL contents and paste

### Migration 4: add_assigned_site_to_requisitions.sql
Open: `database/migrations/add_assigned_site_to_requisitions.sql` - Copy ALL contents and paste

**How to run:**
1. Click on PostgreSQL service in Railway
2. Go to "Connect" tab → "Query"
3. Paste SQL → Click "Run"
4. Repeat for each file

---

## Step 6: Deploy Frontend

**You need to do this in Railway:**
1. Click "+ New" → "GitHub Repo"
2. Select `island-radiology-app` repository
3. Settings → Root Directory: `frontend`
4. Variables → Add: `VITE_API_URL` = `https://YOUR-BACKEND-URL.railway.app/api`
   - Replace `YOUR-BACKEND-URL` with your actual backend URL from Step 4
5. Settings → Networking → Generate Domain

**I cannot do this for you** - you need to click in Railway's interface.

---

## What I CAN Help With

✅ I can prepare SQL files (already done)
✅ I can help troubleshoot errors
✅ I can verify configurations
✅ I can create helper scripts
✅ I can answer questions

## What I CANNOT Do

❌ Click buttons in Railway's web interface
❌ Add environment variables directly
❌ Create services in Railway
❌ Access Railway's database query interface

---

## Quick Checklist

- [ ] PostgreSQL database added
- [ ] Database connected to backend (DATABASE_URL added)
- [ ] NODE_ENV = production
- [ ] PORT = 5001
- [ ] JWT_SECRET = (your secret)
- [ ] Backend domain generated
- [ ] Database migrations run (4 SQL files)
- [ ] Frontend service created
- [ ] Frontend Root Directory = frontend
- [ ] VITE_API_URL set
- [ ] Frontend domain generated

---

**Start with Step 1 (Add PostgreSQL Database) and let me know when you're ready for the next step!**
