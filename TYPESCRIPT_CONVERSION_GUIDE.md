# TypeScript Conversion Guide for Island Radiology Management System

This guide will walk you through converting the application from JavaScript to TypeScript and deploying it to an online server.

## Overview

We'll convert both the backend (Node.js/Express) and frontend (React/Vite) to TypeScript for better type safety, IDE support, and maintainability.

## Step 1: Backend TypeScript Setup

### 1.1 Install TypeScript Dependencies

```bash
cd backend
npm install --save-dev typescript @types/node @types/express @types/pg @types/cors ts-node nodemon
```

### 1.2 Create TypeScript Configuration

Create `backend/tsconfig.json` (already created - see files)

### 1.3 Create Type Definitions

Type definitions are in `backend/src/types/` (already created - see files)

### 1.4 Update package.json Scripts

Update backend package.json to use TypeScript:
- `dev`: Use `nodemon` with `ts-node`
- `build`: Compile TypeScript to JavaScript
- `start`: Run compiled JavaScript

## Step 2: Frontend TypeScript Setup

### 2.1 Install TypeScript Dependencies

```bash
cd frontend
npm install --save-dev typescript @types/react @types/react-dom @vitejs/plugin-react
```

### 2.2 Create TypeScript Configuration

Create `frontend/tsconfig.json` and update `vite.config.ts`

### 2.3 Create Type Definitions

Type definitions are in `frontend/src/types/`

## Step 3: Converting Files

### Pattern for Conversion:
- `.js` → `.ts`
- `.jsx` → `.tsx`
- Add type annotations
- Use interfaces/types from `types/` folder

### Example: Converting a Model

**Before (Radiologist.js)**:
```javascript
const pool = require('../config/database');
class Radiologist {
  static async getAll() {
    const result = await pool.query('SELECT * FROM radiologists');
    return result.rows;
  }
}
```

**After (Radiologist.ts)**:
```typescript
import pool from '../config/database';
import { RadiologistRow } from '../types/database';

class Radiologist {
  static async getAll(): Promise<RadiologistRow[]> {
    const result = await pool.query('SELECT * FROM radiologists');
    return result.rows;
  }
}
```

## Step 4: Deployment Options

### Option A: Heroku (Easiest)
### Option B: Railway
### Option C: DigitalOcean App Platform
### Option D: AWS/Azure/GCP

See DEPLOYMENT.md for detailed instructions.
