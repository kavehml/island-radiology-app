-- Migration: Add assigned_radiologist_id to requisitions table
-- This tracks which radiologist is assigned to review/process each requisition

ALTER TABLE requisitions 
ADD COLUMN IF NOT EXISTS assigned_radiologist_id INTEGER REFERENCES radiologists(id);

-- Add index for faster radiologist-based queries
CREATE INDEX IF NOT EXISTS idx_requisitions_assigned_radiologist ON requisitions(assigned_radiologist_id);
