# Quick Deployment Guide

> 📖 **For detailed step-by-step instructions, see `STEP_BY_STEP_DEPLOYMENT.md`**

## 🚀 Deploy to Railway (Recommended - Easiest)

### Prerequisites
- GitHub account with your code pushed
- Railway account (free at [railway.app](https://railway.app))

### Steps

1. **Sign up & Create Project**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project" or "+ New"
   - Select "GitHub Repository" from the options
   - Authorize GitHub access if prompted
   - Select your repository from the list

2. **Add PostgreSQL Database**
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway creates it automatically

3. **Deploy Backend**
   - Click "+ New" → "GitHub Repo" → Select your repo
   - Settings → Root Directory: `backend`
   - Variables tab → Add:
     ```
     NODE_ENV=production
     PORT=5001
     JWT_SECRET=your-secret-key-min-32-chars
     ```
   - Click "Add Reference" → Select PostgreSQL (adds DATABASE_URL automatically)
   - Settings → Deploy:
     - Build: `npm install && npm run build`
     - Start: `npm start`
   - Generate domain in Networking tab

4. **Run Database Migrations**
   - Go to PostgreSQL → Connect → Query
   - Run these files in order:
     1. `database/schema.sql`
     2. `database/migrations/add_users_table.sql`
     3. `database/migrations/add_requisitions_table.sql`
     4. `database/migrations/add_assigned_site_to_requisitions.sql`

5. **Deploy Frontend**
   - Click "+ New" → "GitHub Repo" → Select your repo
   - Settings → Root Directory: `frontend`
   - Variables tab → Add:
     ```
     VITE_API_URL=https://your-backend-url.railway.app/api
     ```
     (Replace with your actual backend URL from step 3)
   - Settings → Deploy:
     - Build: `npm install && npm run build`
     - Start: `npm run preview`
   - Generate domain in Networking tab

6. **Update Backend CORS**
   - Go to Backend service → Variables
   - Add: `FRONTEND_URL=https://your-frontend-url.railway.app`
   - (Backend will auto-redeploy)

7. **Test**
   - Backend: `https://your-backend.railway.app/api/health`
   - Frontend: `https://your-frontend.railway.app`
   - Login with: `admin@radiology.com` / `admin123`

## 📋 Environment Variables Checklist

### Backend:
- ✅ `NODE_ENV=production`
- ✅ `PORT=5001`
- ✅ `JWT_SECRET=<your-secret>`
- ✅ `DATABASE_URL` (auto-added by Railway)
- ✅ `FRONTEND_URL=<your-frontend-url>`

### Frontend:
- ✅ `VITE_API_URL=<your-backend-url>/api`

## 🆘 Troubleshooting

**Backend won't start?**
- Check build logs in Railway
- Verify `dist/server.js` exists
- Check environment variables

**Frontend can't connect?**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS settings

**Database errors?**
- Run all migrations
- Check `DATABASE_URL` is set
- Verify database is running

## 📚 Full Guide

See `DEPLOY_TO_RAILWAY.md` for detailed step-by-step instructions.

## 💰 Cost

- Railway free tier: $5 credit/month (usually enough)
- Pro plan: $20/month (if you need more)

Your app is now live! 🎉
