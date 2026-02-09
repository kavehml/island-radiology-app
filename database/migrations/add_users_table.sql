-- Migration: Add users table for authentication
-- This extends the existing radiologists table with authentication capabilities

-- Create users table (separate from radiologists to support non-radiologist users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  name VARCHAR(255) NOT NULL,
  radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add password_hash column to radiologists table (for backward compatibility)
-- This allows radiologists to login directly
ALTER TABLE radiologists 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO users (email, password_hash, role, name, is_active)
VALUES (
  'admin@islandradiology.com',
  '$2a$10$ajIUW4ZFjs9WZEX9Bt6r4Oi/QoxkllsFo75Pzujiw1jM6OweEYgtO',
  'admin',
  'System Administrator',
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert default staff user (password: staff123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO users (email, password_hash, role, name, is_active)
VALUES (
  'staff@islandradiology.com',
  '$2a$10$Py62suHYzjsSAaDMCzMsn.jqnflW9VB7Lq447wEGaoFvrbaye3jyO',
  'staff',
  'Staff Member',
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert default radiologist user (password: radiologist123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO users (email, password_hash, role, name, is_active)
VALUES (
  'radiologist@islandradiology.com',
  '$2a$10$CF0.s4k2sYc704SYWEMEZuSc89UuMR9qa7PlP2GFNFE2F52vCGui2',
  'radiologist',
  'Radiologist User',
  TRUE
) ON CONFLICT (email) DO NOTHING;
