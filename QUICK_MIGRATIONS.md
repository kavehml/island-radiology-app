# Quick Database Migrations Guide

Since Railway CLI requires interactive mode, here's the easiest way to run migrations:

## Step 1: Link to Railway Project (One-time setup)

Run this in your terminal:

```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"
railway link
```

Select your Railway project when prompted.

## Step 2: Run the Migration Script

After linking, run:

```bash
./run_migrations.sh
```

Or run migrations one by one:

```bash
railway run psql $DATABASE_URL < database/schema.sql
railway run psql $DATABASE_URL < database/migrations/add_users_table.sql
railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql
railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql
```

## Alternative: Use Railway Web Interface

1. Go to Railway → Your PostgreSQL database service
2. Click "Connect" or look for "Query" tab
3. Copy and paste each SQL file content, one at a time:
   - `database/schema.sql`
   - `database/migrations/add_users_table.sql`
   - `database/migrations/add_requisitions_table.sql`
   - `database/migrations/add_assigned_site_to_requisitions.sql`

## After Migrations

Once migrations are complete, you can login with:
- **Admin:** `admin@islandradiology.com` / `admin123`
- **Staff:** `staff@islandradiology.com` / `staff123`
- **Radiologist:** `radiologist@islandradiology.com` / `radiologist123`
