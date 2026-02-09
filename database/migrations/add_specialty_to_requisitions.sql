-- Migration: Add specialty_required to requisitions table
-- This allows requisitions to specify which radiologist specialty is needed

ALTER TABLE requisitions 
ADD COLUMN IF NOT EXISTS specialty_required VARCHAR(100);

-- Add index for faster specialty-based queries
CREATE INDEX IF NOT EXISTS idx_requisitions_specialty ON requisitions(specialty_required);
