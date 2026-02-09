# TypeScript Conversion Examples

This document shows examples of converting JavaScript files to TypeScript.

## Backend Examples

### Example 1: Database Config (database.js → database.ts)

**Before (database.js)**:
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'radiology_app',
  password: process.env.DB_PASSWORD || undefined,
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```

**After (database.ts)**:
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'radiology_app',
  password: process.env.DB_PASSWORD || undefined,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export default pool;
```

### Example 2: Model (Radiologist.js → Radiologist.ts)

**Before (Radiologist.js)**:
```javascript
const pool = require('../config/database');

class Radiologist {
  static async getAll() {
    const result = await pool.query('SELECT * FROM radiologists ORDER BY name');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM radiologists WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = Radiologist;
```

**After (Radiologist.ts)**:
```typescript
import pool from '../config/database';
import { RadiologistRow } from '../types/database';

class Radiologist {
  static async getAll(): Promise<RadiologistRow[]> {
    const result = await pool.query('SELECT * FROM radiologists ORDER BY name');
    return result.rows as RadiologistRow[];
  }

  static async getById(id: number): Promise<RadiologistRow | undefined> {
    const result = await pool.query('SELECT * FROM radiologists WHERE id = $1', [id]);
    return result.rows[0] as RadiologistRow | undefined;
  }
}

export default Radiologist;
```

### Example 3: Controller (radiologistController.js → radiologistController.ts)

**Before**:
```javascript
const Radiologist = require('../models/Radiologist');

const getAllRadiologists = async (req, res) => {
  try {
    const radiologists = await Radiologist.getAll();
    res.json(radiologists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**After**:
```typescript
import { Request, Response } from 'express';
import Radiologist from '../models/Radiologist';
import { RadiologistRow } from '../types/database';

export const getAllRadiologists = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiologists: RadiologistRow[] = await Radiologist.getAll();
    res.json(radiologists);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
```

### Example 4: Server (server.js → server.ts)

**Before**:
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**After**:
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Examples

### Example 1: Component (Dashboard.jsx → Dashboard.tsx)

**Before (Dashboard.jsx)**:
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalSites: 0,
    totalOrders: 0,
    pendingOrders: 0,
    timeSensitiveOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // ...
  };

  return (
    <div className="dashboard-page">
      {/* JSX */}
    </div>
  );
}
```

**After (Dashboard.tsx)**:
```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

interface DashboardStats {
  totalSites: number;
  totalOrders: number;
  pendingOrders: number;
  timeSensitiveOrders: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    totalOrders: 0,
    pendingOrders: 0,
    timeSensitiveOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      const [sitesRes, ordersRes, pendingRes, timeSensitiveRes] = await Promise.all([
        axios.get<Site[]>(`${API_URL}/sites`),
        axios.get<Order[]>(`${API_URL}/orders`),
        axios.get<Order[]>(`${API_URL}/orders?status=pending`),
        axios.get<Order[]>(`${API_URL}/orders?timeSensitive=true`)
      ]);

      setStats({
        totalSites: sitesRes.data.length,
        totalOrders: ordersRes.data.length,
        pendingOrders: pendingRes.data.length,
        timeSensitiveOrders: timeSensitiveRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard-page">
      {/* JSX */}
    </div>
  );
};

export default Dashboard;
```

### Example 2: Form Component with Props

**Before**:
```javascript
function RadiologistForm({ radiologist, onClose, onSuccess }) {
  // ...
}
```

**After**:
```typescript
import { Radiologist } from '../types';

interface RadiologistFormProps {
  radiologist?: Radiologist;
  onClose: () => void;
  onSuccess: () => void;
}

const RadiologistForm: React.FC<RadiologistFormProps> = ({ 
  radiologist, 
  onClose, 
  onSuccess 
}) => {
  // ...
};
```

## Conversion Checklist

For each file:

- [ ] Change extension: `.js` → `.ts`, `.jsx` → `.tsx`
- [ ] Replace `require()` with `import`
- [ ] Replace `module.exports` with `export`
- [ ] Add type annotations to function parameters
- [ ] Add return types to functions
- [ ] Add interfaces/types for objects
- [ ] Import types from `types/` folder
- [ ] Add type assertions where needed (`as Type`)
- [ ] Handle `null`/`undefined` properly
- [ ] Update imports to use `.ts` extensions (if needed)

## Common Patterns

### Express Request/Response
```typescript
import { Request, Response } from 'express';

export const handler = async (req: Request, res: Response): Promise<void> => {
  // ...
};
```

### Database Queries
```typescript
const result = await pool.query<RowType>('SELECT ...');
return result.rows as RowType[];
```

### React Components
```typescript
interface Props {
  // ...
}

const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // ...
};
```

### Async Functions
```typescript
const fetchData = async (): Promise<DataType> => {
  const response = await axios.get<DataType>(url);
  return response.data;
};
```
