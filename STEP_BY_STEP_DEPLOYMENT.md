# 🚀 Step-by-Step Deployment Guide

This is a complete, detailed guide to deploy your Island Radiology application to Railway. Follow each step carefully.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] **Your code pushed to a GitHub repository** ⚠️ **IMPORTANT: Do this FIRST!**
- [ ] A GitHub account
- [ ] A Railway account (we'll create this in Step 1)

### ⚠️ IMPORTANT: GitHub Setup Required First!

**If you haven't pushed your code to GitHub yet**, follow `GITHUB_SETUP.md` first!

This guide assumes your code is already on GitHub. If not, stop here and complete GitHub setup first.

---

## Step 1: Create Railway Account

1. **Open your web browser** and go to: https://railway.app
2. **Click** the "Start a New Project" button (or "Login" if you already have an account)
3. **Choose** "Login with GitHub"
4. **Authorize** Railway to access your GitHub account
5. You should now see the Railway dashboard

✅ **Checkpoint**: You should see the Railway dashboard with "New Project" button

---

## Step 2: Create New Project

1. **Click** the big "+ New" button (or "New Project")
2. You'll see a screen asking **"What would you like to create?"**
3. **Click** on **"GitHub Repository"** (this is usually highlighted/selected by default)
4. **If prompted**, authorize Railway to access your GitHub repositories
5. You'll see a list of your GitHub repositories
6. **Find and click** on your repository name (the one with your Island Radiology code)
7. Railway will start creating a project and connecting it to your GitHub repo

✅ **Checkpoint**: You should see a new project created with your repository name. You'll see it in your Railway dashboard.

---

## Step 3: Add PostgreSQL Database

1. **In your Railway project**, click the "+ New" button
2. **Click** on "Database"
3. **Select** "Add PostgreSQL"
4. Railway will automatically create a PostgreSQL database
5. **Wait** for it to finish provisioning (takes ~30 seconds)
6. **Click** on the PostgreSQL service that was created
7. **Note**: You'll see connection details, but Railway will handle this automatically

✅ **Checkpoint**: You should see a PostgreSQL service in your project

---

## Step 4: Deploy Backend Service

### 4.1 Create Backend Service

1. **Click** the "+ New" button again
2. **Select** "GitHub Repo"
3. **Choose** the same repository (your Island Radiology repo)
4. Railway will detect it's a Node.js project

### 4.2 Configure Backend Settings

1. **Click** on the new service (it might be named after your repo)
2. **Go to** the "Settings" tab (top menu)
3. **Scroll down** to "Root Directory"
4. **Type**: `backend`
5. **Click** "Save"

### 4.3 Set Build and Start Commands

1. **Still in Settings**, scroll to "Deploy" section
2. **Build Command**: Type `npm install && npm run build`
3. **Start Command**: Type `npm start`
4. **Click** "Save"

### 4.4 Add Environment Variables

1. **Go to** the "Variables" tab (top menu)
2. **Click** "New Variable" or "+" button
3. **Add these variables one by one**:

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click "Add"

   **Variable 2:**
   - Name: `PORT`
   - Value: `5001`
   - Click "Add"

   **Variable 3:**
   - Name: `JWT_SECRET`
   - Value: `your-super-secret-jwt-key-change-this-to-random-32-chars-minimum`
   - ⚠️ **Important**: Replace with a random string (at least 32 characters)
   - Click "Add"

### 4.5 Connect Database

1. **Still in Variables tab**, click "New Variable"
2. **Instead of typing**, click "Add Reference" button
3. **Select** your PostgreSQL database from the dropdown
4. Railway will automatically add `DATABASE_URL` variable
5. **Verify** you see `DATABASE_URL` in your variables list

### 4.6 Generate Backend Domain

1. **Go to** the "Settings" tab
2. **Scroll** to "Networking" section
3. **Click** "Generate Domain"
4. Railway will create a domain like: `your-backend-name.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend!
6. **Example**: `https://island-radiology-backend.up.railway.app`

✅ **Checkpoint**: Backend should start deploying. Check the "Deployments" tab to see progress.

---

## Step 5: Run Database Migrations

### Option A: Using Railway Web Interface (Easier)

1. **Go to** your PostgreSQL database service
2. **Click** the "Connect" tab
3. **Click** "Query" button
4. **Open** your local file: `database/schema.sql`
5. **Copy ALL** the contents (Cmd+A, Cmd+C)
6. **Paste** into the Railway query editor
7. **Click** "Run" button
8. **Wait** for success message

9. **Repeat** for each migration file:
   - `database/migrations/add_users_table.sql`
   - `database/migrations/add_requisitions_table.sql`
   - `database/migrations/add_assigned_site_to_requisitions.sql`

### Option B: Using Railway CLI (Advanced)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Link to project**:
   ```bash
   railway link
   ```
   (Select your project when prompted)

4. **Run migrations**:
   ```bash
   railway run psql $DATABASE_URL < database/schema.sql
   railway run psql $DATABASE_URL < database/migrations/add_users_table.sql
   railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql
   railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql
   ```

✅ **Checkpoint**: All migrations should complete without errors

---

## Step 6: Verify Backend is Working

1. **Go to** your backend service
2. **Check** the "Deployments" tab
3. **Look for** a green checkmark (✅) indicating successful deployment
4. **Click** on the latest deployment to see logs
5. **Look for**: "Server running on port 5001"

6. **Test the health endpoint**:
   - Copy your backend URL (from Step 4.6)
   - Add `/api/health` to the end
   - Example: `https://your-backend-name.up.railway.app/api/health`
   - **Open** in browser or use curl:
     ```bash
     curl https://your-backend-name.up.railway.app/api/health
     ```
   - **Should return**: `{"status":"OK"}`

✅ **Checkpoint**: Backend health check returns `{"status":"OK"}`

---

## Step 7: Deploy Frontend Service

### 7.1 Create Frontend Service

1. **In your Railway project**, click "+ New" button
2. **Select** "GitHub Repo"
3. **Choose** the same repository again
4. Railway will create another service

### 7.2 Configure Frontend Settings

1. **Click** on the new service
2. **Go to** "Settings" tab
3. **Set Root Directory** to: `frontend`
4. **Click** "Save"

### 7.3 Set Build and Start Commands

1. **Still in Settings**, scroll to "Deploy" section
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run preview`
4. **Click** "Save"

### 7.4 Add Frontend Environment Variable

1. **Go to** "Variables" tab
2. **Click** "New Variable"
3. **Name**: `VITE_API_URL`
4. **Value**: `https://your-backend-url.railway.app/api`
   - ⚠️ **Replace** `your-backend-url.railway.app` with your ACTUAL backend URL from Step 4.6
   - **Example**: `https://island-radiology-backend.up.railway.app/api`
5. **Click** "Add"

✅ **Checkpoint**: Frontend should start building. Check "Deployments" tab.

---

## Step 8: Generate Frontend Domain

1. **Go to** your frontend service
2. **Settings** tab → "Networking" section
3. **Click** "Generate Domain"
4. Railway creates a domain like: `your-frontend-name.up.railway.app`
5. **Copy this URL** - this is your public website!

✅ **Checkpoint**: Frontend should finish deploying. Check "Deployments" tab for green checkmark.

---

## Step 9: Update Backend CORS Settings

1. **Go back to** your backend service
2. **Go to** "Variables" tab
3. **Click** "New Variable"
4. **Name**: `FRONTEND_URL`
5. **Value**: Your frontend URL from Step 8 (without `/api`)
   - **Example**: `https://island-radiology-frontend.up.railway.app`
6. **Click** "Add"
7. Railway will automatically redeploy the backend

✅ **Checkpoint**: Backend redeploys with new CORS settings

---

## Step 10: Test Your Deployment

### 10.1 Test Backend

1. **Open** your backend health endpoint:
   ```
   https://your-backend-url.railway.app/api/health
   ```
2. **Should see**: `{"status":"OK"}`

### 10.2 Test Frontend

1. **Open** your frontend URL:
   ```
   https://your-frontend-url.railway.app
   ```
2. **Should see**: Your login page

### 10.3 Test Login

1. **On the login page**, enter:
   - **Email**: `admin@radiology.com`
   - **Password**: `admin123`
2. **Click** "Login"
3. **Should see**: Dashboard

✅ **Checkpoint**: You can log in and see the dashboard!

---

## Step 11: Security - Change Default Password

⚠️ **IMPORTANT**: Change the default admin password immediately!

### Option A: Using Database Query

1. **Go to** PostgreSQL service → "Connect" → "Query"
2. **Run this query** (replace `NEW_PASSWORD_HASH` with bcrypt hash of your new password):
   ```sql
   UPDATE users 
   SET password_hash = '$2a$10$YOUR_NEW_PASSWORD_HASH_HERE'
   WHERE email = 'admin@radiology.com';
   ```

### Option B: Using the Application

1. **Log in** with default credentials
2. **Go to** Users page (if you have a change password feature)
3. **Change** the password

### Generate Password Hash (if needed):

```bash
# Install bcrypt-cli
npm install -g bcrypt-cli

# Generate hash
bcrypt-cli "your-new-password" 10
```

✅ **Checkpoint**: Default password is changed

---

## Step 12: Final Verification

Test these features:

- [ ] **Login** works
- [ ] **Dashboard** loads
- [ ] **Sites** page loads
- [ ] **Radiologists** page loads
- [ ] **Requisitions** page loads (admin/staff only)
- [ ] **Submit Requisition** form works (public)
- [ ] **Patient Portal** works (public)
   - Go to: `https://your-frontend-url.railway.app/patient-portal`
   - Enter a requisition number and DOB

---

## 🎉 Congratulations!

Your application is now live and accessible to the world!

### Your URLs:
- **Frontend**: `https://your-frontend-url.railway.app`
- **Backend API**: `https://your-backend-url.railway.app/api`
- **Patient Portal**: `https://your-frontend-url.railway.app/patient-portal`

---

## 🆘 Troubleshooting

### Backend won't start:
1. **Check** "Deployments" tab → Click latest deployment → View logs
2. **Look for** error messages
3. **Common issues**:
   - Missing environment variables → Check Variables tab
   - Database connection error → Verify DATABASE_URL is set
   - Build failed → Check build logs

### Frontend can't connect to backend:
1. **Verify** `VITE_API_URL` is set correctly in frontend variables
2. **Check** backend is running (test `/api/health`)
3. **Verify** `FRONTEND_URL` is set in backend variables
4. **Check** browser console for CORS errors

### Database errors:
1. **Verify** migrations ran successfully
2. **Check** `DATABASE_URL` is set in backend
3. **Verify** database is running (green status in Railway)

### 502 Bad Gateway:
- Service crashed → Check logs in Deployments tab
- Usually means environment variable issue or build failure

---

## 📊 Monitoring

Railway provides built-in monitoring:
- **Go to** any service → "Metrics" tab
- See CPU, Memory, Network usage
- View logs in "Deployments" tab

---

## 💰 Cost Information

- **Railway Free Tier**: $5 credit/month
- **Usually enough** for small applications
- **Pro Plan**: $20/month if you need more resources

---

## 🔄 Updating Your Application

When you make changes:

1. **Push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Railway automatically** detects changes and redeploys

3. **Check** "Deployments" tab to see progress

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Support**: Check Railway dashboard → Help section

---

## ✅ Deployment Checklist Summary

- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] PostgreSQL database added
- [ ] Backend service deployed
- [ ] Backend environment variables set
- [ ] Backend domain generated
- [ ] Database migrations run
- [ ] Backend health check passes
- [ ] Frontend service deployed
- [ ] Frontend environment variables set
- [ ] Frontend domain generated
- [ ] Backend CORS updated
- [ ] Frontend loads correctly
- [ ] Login works
- [ ] Default password changed

---

**You're all set! Your application is live! 🚀**
