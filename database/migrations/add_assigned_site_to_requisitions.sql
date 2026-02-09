-- Migration: Add assigned_site_id to requisitions table for automatic center assignment

-- Add assigned_site_id column to requisitions table
ALTER TABLE requisitions 
ADD COLUMN IF NOT EXISTS assigned_site_id INTEGER REFERENCES sites(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS assignment_reason TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_requisitions_assigned_site ON requisitions(assigned_site_id);
