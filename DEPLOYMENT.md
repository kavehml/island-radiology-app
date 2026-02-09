# Deployment Guide - Island Radiology Management System

This guide covers deploying your TypeScript application to various cloud platforms.

## Prerequisites

1. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Database**: Set up a PostgreSQL database (can be managed service or self-hosted)
3. **Environment Variables**: Prepare your `.env` variables

## Option 1: Railway (Recommended - Easiest)

Railway is great for full-stack apps with databases.

### Steps:

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Set up Backend**:
   - Add a new service → "GitHub Repo"
   - Select your repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables:
     ```
     DB_USER=postgres
     DB_HOST=your-db-host
     DB_NAME=radiology_app
     DB_PASSWORD=your-password
     DB_PORT=5432
     PORT=5001
     NODE_ENV=production
     ```

4. **Set up Database**:
   - Add PostgreSQL service
   - Railway will provide connection string automatically
   - Update backend env vars to use Railway's DB

5. **Set up Frontend**:
   - Add another service → "GitHub Repo"
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```

6. **Run Database Migrations**:
   - In backend service, go to "Deployments" → "Run Command"
   - Run: `psql $DATABASE_URL < database/schema.sql`

## Option 2: Heroku

### Steps:

1. **Install Heroku CLI**: `brew install heroku/brew/heroku`

2. **Login**: `heroku login`

3. **Create Apps**:
   ```bash
   # Backend
   cd backend
   heroku create your-app-backend
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Frontend
   cd ../frontend
   heroku create your-app-frontend
   ```

4. **Backend Setup**:
   ```bash
   cd backend
   # Create Procfile
   echo "web: node dist/server.js" > Procfile
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set PORT=5001
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

5. **Database Migration**:
   ```bash
   heroku pg:psql < database/schema.sql
   ```

6. **Frontend Setup**:
   ```bash
   cd frontend
   # Create static.json for SPA routing
   echo '{"root": "dist", "clean_urls": true, "routes": {"/*": "index.html"}}' > static.json
   
   # Build and deploy
   npm run build
   git subtree push --prefix frontend heroku main
   ```

## Option 3: DigitalOcean App Platform

1. **Create App**: Go to DigitalOcean → App Platform → Create App
2. **Connect GitHub**: Link your repository
3. **Configure Backend**:
   - Type: Web Service
   - Source: `backend/`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - Environment Variables: Add all from `.env`
4. **Configure Database**: Add PostgreSQL database component
5. **Configure Frontend**:
   - Type: Static Site
   - Source: `frontend/`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`

## Option 4: Vercel (Frontend) + Railway/Render (Backend)

### Frontend on Vercel:

1. **Sign up**: [vercel.com](https://vercel.com)
2. **Import Project**: Connect GitHub repo
3. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-url
     ```

### Backend on Render:

1. **Sign up**: [render.com](https://render.com)
2. **Create Web Service**:
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add PostgreSQL database
   - Set environment variables

## Environment Variables Checklist

### Backend (.env):
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=radiology_app
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5001
NODE_ENV=production
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend-url.com
```

## Post-Deployment Checklist

- [ ] Database schema migrated
- [ ] Environment variables set
- [ ] Backend health check: `curl https://your-backend-url/api/health`
- [ ] Frontend loads correctly
- [ ] CORS configured (if frontend/backend on different domains)
- [ ] SSL/HTTPS enabled
- [ ] Error logging set up (Sentry, LogRocket, etc.)
- [ ] Monitoring set up (UptimeRobot, etc.)

## Troubleshooting

### Backend won't start:
- Check logs: `heroku logs --tail` or Railway logs
- Verify environment variables
- Check database connection
- Ensure `dist/` folder exists after build

### Frontend can't connect to backend:
- Check CORS settings in backend
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Verify backend is running and accessible

### Database connection errors:
- Verify database credentials
- Check if database is accessible from your hosting platform
- Some platforms require SSL connections

## Cost Estimates

- **Railway**: ~$5-20/month (includes database)
- **Heroku**: ~$7/month (backend) + $7/month (database) = $14/month
- **DigitalOcean**: ~$12/month (App Platform) + $15/month (database) = $27/month
- **Vercel + Render**: Free tier available, then ~$7/month each

## Security Considerations

1. **Never commit `.env` files** - Use platform environment variables
2. **Enable HTTPS** - Most platforms do this automatically
3. **Set up CORS** - Restrict to your frontend domain
4. **Database Security** - Use strong passwords, enable SSL
5. **Rate Limiting** - Consider adding rate limiting to API
6. **Authentication** - Add authentication if needed for production

## Next Steps

1. Set up CI/CD pipeline
2. Add automated testing
3. Set up error monitoring (Sentry)
4. Configure backups for database
5. Set up staging environment
