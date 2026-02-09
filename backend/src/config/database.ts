import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Support DATABASE_URL (used by Railway, Heroku, Render, etc.)
// Format: postgresql://user:password@host:port/database
let poolConfig: any = {};

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL directly (Railway, Heroku, Render provide this)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
} else {
  // Use individual environment variables
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'radiology_app',
    password: process.env.DB_PASSWORD || undefined,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };
}

const pool = new Pool(poolConfig);

export default pool;
