# Quick Start Guide - How to Rerun the Project

## Quick Check: Are Servers Running?

**Check Backend (port 5000):**
```bash
lsof -ti:5000 && echo "✅ Backend is running" || echo "❌ Backend is NOT running"
```

**Check Frontend (port 3000):**
```bash
lsof -ti:3000 && echo "✅ Frontend is running" || echo "❌ Frontend is NOT running"
```

---

## Step-by-Step: Rerun the Project

### Step 1: Check PostgreSQL is Running

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# OR
psql -l
```

**If PostgreSQL is NOT running:**
```bash
brew services start postgresql@16
```

### Step 2: Verify Database Exists

```bash
# Check if database exists
psql -l | grep radiology_app
```

**If database doesn't exist:**
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"
createdb radiology_app
psql radiology_app < database/schema.sql
```

### Step 3: Stop Any Running Servers (if needed)

**Stop Backend (if running):**
```bash
kill $(lsof -ti:5000) 2>/dev/null || echo "Backend not running"
```

**Stop Frontend (if running):**
```bash
kill $(lsof -ti:3000) 2>/dev/null || echo "Frontend not running"
```

### Step 4: Start Backend Server

**Open Terminal 1:**
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/backend"
npm run dev
```

**Expected output:**
```
Server running on port 5000
```

**Keep this terminal open!**

### Step 5: Start Frontend Server

**Open Terminal 2 (new terminal window):**
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/frontend"
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

**Keep this terminal open!**

### Step 6: Open Application

Open your web browser and navigate to:
```
http://localhost:3000
```

---

## One-Line Commands (Copy & Paste)

### Start Everything (if nothing is running):

**Terminal 1 - Backend:**
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/backend" && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/frontend" && npm run dev
```

### Stop Everything:

```bash
kill $(lsof -ti:5000) 2>/dev/null; kill $(lsof -ti:3000) 2>/dev/null; echo "All servers stopped"
```

### Restart Everything:

```bash
# Stop servers
kill $(lsof -ti:5000) 2>/dev/null; kill $(lsof -ti:3000) 2>/dev/null

# Start backend (in Terminal 1)
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/backend" && npm run dev &

# Start frontend (in Terminal 2)
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/frontend" && npm run dev
```

---

## Troubleshooting

### Backend won't start:
- **Port 5000 in use:** `kill $(lsof -ti:5000)` then try again
- **Missing .env file:** Check `backend/.env` exists with correct database credentials
- **Database connection error:** Verify PostgreSQL is running and database exists

### Frontend won't start:
- **Port 3000 in use:** `kill $(lsof -ti:3000)` then try again
- **Backend not running:** Start backend first, then frontend

### Database errors:
- **PostgreSQL not running:** `brew services start postgresql@16`
- **Database doesn't exist:** Run `createdb radiology_app` and `psql radiology_app < database/schema.sql`

### Dependencies not installed:
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd frontend && npm install
```

---

## Current Status Check

Run this command to check everything at once:

```bash
echo "=== Project Status ===" && \
echo "PostgreSQL:" && (psql -l > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running") && \
echo "Database:" && (psql -l | grep radiology_app > /dev/null && echo "✅ Exists" || echo "❌ Missing") && \
echo "Backend (port 5000):" && (lsof -ti:5000 > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running") && \
echo "Frontend (port 3000):" && (lsof -ti:3000 > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running")
```

---

## Summary

**To rerun the project:**

1. ✅ Ensure PostgreSQL is running
2. ✅ Ensure database `radiology_app` exists
3. ✅ Start backend: `cd backend && npm run dev` (Terminal 1)
4. ✅ Start frontend: `cd frontend && npm run dev` (Terminal 2)
5. ✅ Open browser: `http://localhost:3000`

That's it! 🚀
