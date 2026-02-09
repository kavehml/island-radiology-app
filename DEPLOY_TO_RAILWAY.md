# Deploy to Railway - Step-by-Step Guide

Railway is the easiest platform to deploy your full-stack application. This guide will walk you through deploying both backend and frontend.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app) (free tier available)

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with GitHub
4. Select "Deploy from GitHub repo"
5. Choose your repository

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. **Important**: Note the database name - you'll need it later

## Step 4: Deploy Backend

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your repository
4. Railway will detect it's a Node.js project

### Configure Backend Service:

1. Click on the backend service
2. Go to **"Settings"** tab
3. Set **Root Directory** to: `backend`
4. Go to **"Variables"** tab and add:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

5. **Important**: Add the database connection:
   - Click **"Add Reference"** 
   - Select your PostgreSQL database
   - Railway will automatically add `DATABASE_URL` variable

6. Go to **"Settings"** → **"Deploy"**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

7. Click **"Deploy"** or Railway will auto-deploy

### Get Backend URL:

1. After deployment, go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** to get a public URL
3. Copy this URL (e.g., `https://your-backend.railway.app`)
4. **Important**: Add this to your environment variables:
   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```

## Step 5: Run Database Migrations

1. In Railway, go to your **PostgreSQL database**
2. Click **"Connect"** → **"Query"**
3. Copy and paste the contents of `database/schema.sql`
4. Click **"Run"**
5. Then run `database/migrations/add_users_table.sql`
6. Then run `database/migrations/add_requisitions_table.sql`
7. Then run `database/migrations/add_assigned_site_to_requisitions.sql`

**Alternative (using Railway CLI):**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run psql $DATABASE_URL < database/schema.sql
railway run psql $DATABASE_URL < database/migrations/add_users_table.sql
railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql
railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql
```

## Step 6: Deploy Frontend

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose the same repository
4. Click on the new service

### Configure Frontend Service:

1. Go to **"Settings"** tab
2. Set **Root Directory** to: `frontend`
3. Go to **"Variables"** tab and add:

```
VITE_API_URL=https://your-backend.railway.app/api
```

**Replace `your-backend.railway.app` with your actual backend URL from Step 4**

4. Go to **"Settings"** → **"Deploy"**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

5. Click **"Deploy"**

### Get Frontend URL:

1. After deployment, go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** to get a public URL
3. Copy this URL (e.g., `https://your-frontend.railway.app`)

## Step 7: Update Backend CORS

1. Go back to your **Backend service**
2. Go to **"Variables"** tab
3. Add/Update:
   ```
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Redeploy the backend (Railway will auto-redeploy when variables change)

## Step 8: Test Your Deployment

1. **Backend Health Check**:
   ```
   https://your-backend.railway.app/api/health
   ```
   Should return: `{"status":"OK"}`

2. **Frontend**:
   ```
   https://your-frontend.railway.app
   ```
   Should load your application

3. **Test Login**:
   - Use default admin credentials (from migrations)
   - Email: `admin@radiology.com`
   - Password: `admin123` (change this in production!)

## Step 9: Create Default Admin User (If Needed)

If you need to create an admin user, you can use Railway's database query:

1. Go to PostgreSQL database → **"Connect"** → **"Query"**
2. Run:
```sql
INSERT INTO users (name, email, password_hash, role) 
VALUES (
  'Admin User',
  'admin@radiology.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
  'admin'
);
```

**Note**: The password hash above is for `admin123`. Use bcrypt to generate a new hash for a different password.

## Environment Variables Summary

### Backend Variables:
```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-secret-key-min-32-characters
DATABASE_URL=<auto-added by Railway>
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend Variables:
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Troubleshooting

### Backend won't start:
1. Check **"Deployments"** tab for build logs
2. Verify `dist/server.js` exists after build
3. Check environment variables are set correctly
4. Verify database connection (check `DATABASE_URL`)

### Frontend can't connect to backend:
1. Verify `VITE_API_URL` is set correctly
2. Check backend CORS settings
3. Verify backend is running (check health endpoint)
4. Check browser console for errors

### Database connection errors:
1. Verify `DATABASE_URL` is set in backend variables
2. Check database is running in Railway
3. Verify migrations have been run

### 502 Bad Gateway:
- Usually means the service crashed
- Check logs in Railway dashboard
- Verify all environment variables are set

## Cost

Railway offers:
- **Free Tier**: $5 credit/month (usually enough for small apps)
- **Pro Plan**: $20/month (includes more resources)

## Next Steps

1. **Set up custom domains** (optional):
   - In Railway, go to service → Settings → Networking
   - Add your custom domain

2. **Enable monitoring**:
   - Railway provides built-in metrics
   - Consider adding error tracking (Sentry)

3. **Set up backups**:
   - Railway automatically backs up PostgreSQL databases
   - Consider exporting data regularly

4. **Security**:
   - Change default admin password
   - Use strong JWT_SECRET
   - Enable HTTPS (automatic on Railway)

5. **Performance**:
   - Monitor resource usage in Railway dashboard
   - Scale up if needed

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

Your application should now be live! 🎉
