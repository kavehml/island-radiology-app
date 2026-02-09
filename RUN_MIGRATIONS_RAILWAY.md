# 🗄️ How to Run Database Migrations on Railway

Railway's interface has changed. Here are the ways to run your SQL migrations:

---

## Option 1: Railway CLI (Easiest - Recommended)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Link to Your Project

```bash
railway link
```
- Select your project when prompted

### Step 4: Run Migrations

Run these commands one by one:

```bash
# Migration 1: Schema
railway run psql $DATABASE_URL < database/schema.sql

# Migration 2: Users table
railway run psql $DATABASE_URL < database/migrations/add_users_table.sql

# Migration 3: Requisitions table
railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql

# Migration 4: Assigned site
railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql
```

**Note:** Make sure you're in your project root directory when running these commands.

---

## Option 2: Using Railway Web Interface (If Available)

### Look for Query Interface:

1. **In the "Data" tab:**
   - Look for a "Query" or "SQL" button
   - Or look for "Run Query" option
   - Sometimes it's a small icon or link

2. **Alternative locations:**
   - Check if there's a "Query" tab next to "Data" and "Config"
   - Look for a "SQL Editor" option
   - Check the "Connect" modal - sometimes there's a "Query" option there

### If you find Query interface:

1. Copy contents of `database/schema.sql`
2. Paste into the query editor
3. Click "Run" or "Execute"
4. Repeat for each migration file

---

## Option 3: Use External Database Tool

### Get Connection String:

1. Click "Connect" button in Railway
2. Copy the connection details shown
3. Use a tool like:
   - **pgAdmin** (desktop app)
   - **DBeaver** (desktop app)
   - **TablePlus** (desktop app)
   - **Postico** (Mac only)
   - **psql** command line (if you have PostgreSQL installed)

### Connect and Run:

1. Connect using the credentials from Railway
2. Run each SQL file

---

## Option 4: Quick Test - Check if Migrations Are Needed

Actually, let's first check if your backend can connect to the database:

1. Go to your backend service
2. Check "Deployments" tab → Latest deployment → Logs
3. Look for database connection errors

If there are no errors, the database might already be working!

---

## Recommended: Use Railway CLI

The CLI method (Option 1) is the most reliable. Here's a quick script:

```bash
# Navigate to your project
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"

# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run all migrations
railway run psql $DATABASE_URL < database/schema.sql
railway run psql $DATABASE_URL < database/migrations/add_users_table.sql
railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql
railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql
```

---

## Troubleshooting

**"railway: command not found"**
- Make sure Railway CLI is installed: `npm install -g @railway/cli`

**"Not linked to a project"**
- Run `railway link` and select your project

**"psql: command not found"**
- Railway CLI handles this automatically, but if it fails, Railway might not have psql in the environment
- Try Option 3 (external tool) instead

---

**Start with Option 1 (Railway CLI) - it's the most reliable method!**
