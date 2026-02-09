# Setup Guide

## Step 1: Install PostgreSQL

You have several options to install PostgreSQL on macOS:

### Option A: Install via Homebrew (Recommended)

1. First, install Homebrew if you don't have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Then install PostgreSQL:
```bash
brew install postgresql@16
```

3. Start PostgreSQL service:
```bash
brew services start postgresql@16
```

4. Add PostgreSQL to your PATH (add to ~/.zshrc):
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Option B: Install PostgreSQL.app (GUI)

1. Download from: https://postgresapp.com/
2. Install and launch the app
3. Click "Initialize" to create a new server
4. Add to PATH (add to ~/.zshrc):
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Option C: Use Docker

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Run PostgreSQL container:
```bash
docker run --name radiology-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=radiology_app \
  -p 5432:5432 \
  -d postgres:16
```

## Step 2: Create Database

Once PostgreSQL is installed and in your PATH:

```bash
# Navigate to project root
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology"

# Create database
createdb radiology_app

# Run schema
psql radiology_app < database/schema.sql
```

## Step 3: Configure Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create `.env` file:
```bash
cp .env.example .env
# Or create manually with these contents:
```

Edit `.env` file with your database credentials:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=radiology_app
DB_PASSWORD=postgres
DB_PORT=5432
PORT=5000
```

**Note:** If using Docker, the password is `postgres`. If using PostgreSQL.app, you might not need a password (leave empty or use your system user).

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

## Step 5: Start Frontend Server

Open a new terminal window:

```bash
cd "/Users/kaveh/Documents/Work and Study/McGill/Courses/EXSU 619-620/Island Solution For Radiology/frontend"
npm run dev
```

The frontend will run on `http://localhost:3000`

## Troubleshooting

### PostgreSQL commands not found
- Make sure PostgreSQL is installed
- Add PostgreSQL bin directory to your PATH (see options above)
- Restart your terminal after adding to PATH

### Database connection errors
- Check that PostgreSQL is running: `brew services list` or check Docker container
- Verify database credentials in `.env` file
- Try connecting manually: `psql -U postgres -d radiology_app`

### Port already in use
- Backend: Change `PORT=5000` to another port in `.env`
- Frontend: Change port in `vite.config.js`

## Quick Start (After PostgreSQL is installed)

```bash
# From project root
createdb radiology_app
psql radiology_app < database/schema.sql

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser!

