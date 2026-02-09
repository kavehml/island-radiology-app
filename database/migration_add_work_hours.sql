-- Migration: Add work hours to radiologists table
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_hours_start TIME;
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_hours_end TIME;
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_days VARCHAR(50); -- e.g., 'Mon-Fri', 'Mon-Sat', etc.

