# How to Run the Application - Step by Step

## Step 1: Update Database Schema

If you already have the database created, run the migration to add work hours columns:

```bash
# Make sure you're in the project root directory
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"

# Run the migration
psql radiology_app < database/migration_add_work_hours.sql
```

**OR** if you're creating a fresh database, the main schema already includes work hours:

```bash
# Create database (if not already created)
createdb radiology_app

# Run the full schema
psql radiology_app < database/schema.sql
```

## Step 2: Start Backend Server

Open **Terminal 1** and run:

```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/backend"
npm run dev
```

You should see:
```
Server running on port 5000
```

**Keep this terminal open!**

## Step 3: Start Frontend Server

Open **Terminal 2** (a new terminal window) and run:

```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/frontend"
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

**Keep this terminal open!**

## Step 4: Open Application

Open your web browser and go to:
```
http://localhost:3000
```

---

## Quick Reference Commands

### If PostgreSQL commands aren't found:
```bash
# Add to PATH (if using Homebrew)
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
# OR
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"

# Then try the commands again
```

### Check if PostgreSQL is running:
```bash
brew services list
# OR
psql -l
```

### If database doesn't exist:
```bash
createdb radiology_app
psql radiology_app < database/schema.sql
```

### If you need to restart:
1. Stop both servers (Ctrl+C in each terminal)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`

---

## Troubleshooting

### Backend won't start:
- Check if port 5000 is already in use
- Verify `.env` file exists in `backend/` folder
- Check database connection: `psql radiology_app`

### Frontend won't start:
- Check if port 3000 is already in use
- Make sure backend is running first

### Database errors:
- Make sure PostgreSQL is running: `brew services start postgresql@16`
- Verify database exists: `psql -l | grep radiology_app`
- Check `.env` file has correct database credentials

