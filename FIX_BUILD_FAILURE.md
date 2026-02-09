# 🔧 Fix Build Failure on Railway

Your build failed. Here's how to fix it step by step:

## Step 1: Check the Error Logs

1. **Click** on the `island-radiology-app` service card
2. **Go to** the "Deployments" tab (top menu)
3. **Click** on the failed deployment (the one with red X)
4. **Scroll down** to see the error logs
5. **Look for** error messages (usually in red)

Common errors you might see:
- "Cannot find module" → Missing dependencies
- "No such file or directory" → Wrong root directory
- "Command failed" → Build command issue

## Step 2: Configure the Service Correctly

### Fix Root Directory:

1. **Click** on your `island-radiology-app` service
2. **Go to** "Settings" tab
3. **Scroll** to "Root Directory" section
4. **Type**: `backend`
5. **Click** "Save"

### Fix Build and Start Commands:

1. **Still in Settings**, scroll to "Deploy" section
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Click** "Save"

## Step 3: Add Required Environment Variables

1. **Go to** "Variables" tab
2. **Add these variables**:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-random-secret-key-minimum-32-characters-long
```

3. **Add Database Reference**:
   - Click "Add Reference"
   - Select your PostgreSQL database
   - This adds `DATABASE_URL` automatically

## Step 4: Redeploy

After making changes:
1. Railway will **automatically redeploy**
2. Or click "Deploy" button manually
3. Watch the "Deployments" tab for progress

## Common Issues & Solutions

### Issue: "Cannot find package.json"
**Solution**: Root Directory must be set to `backend`

### Issue: "dist/server.js not found"
**Solution**: Build command must be `npm install && npm run build`

### Issue: "Database connection failed"
**Solution**: Make sure `DATABASE_URL` is added via "Add Reference"

### Issue: "Port already in use"
**Solution**: Railway sets PORT automatically, but make sure it's in variables

## Quick Fix Checklist

- [ ] Root Directory = `backend`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] NODE_ENV = `production`
- [ ] PORT = `5001`
- [ ] JWT_SECRET = (random 32+ char string)
- [ ] DATABASE_URL = (added via Reference)

## Still Not Working?

Share the error message from the logs and I'll help you fix it!
