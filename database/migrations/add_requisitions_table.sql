-- Migration: Add requisitions table for external order submissions
-- This allows physicians and office admins to submit imaging requisitions

-- Create requisitions table (separate from orders for external submissions)
CREATE TABLE IF NOT EXISTS requisitions (
  id SERIAL PRIMARY KEY,
  -- Requisition details
  requisition_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'converted'
  
  -- Patient information
  patient_id VARCHAR(255),
  patient_name VARCHAR(255) NOT NULL,
  patient_dob DATE,
  patient_phone VARCHAR(50),
  patient_email VARCHAR(255),
  
  -- Referring physician/clinic information
  referring_physician_name VARCHAR(255) NOT NULL,
  referring_physician_npi VARCHAR(50), -- National Provider Identifier
  referring_physician_phone VARCHAR(50),
  referring_physician_email VARCHAR(255),
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  
  -- Order details
  order_type VARCHAR(50) NOT NULL, -- 'CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'
  body_part VARCHAR(255),
  clinical_indication TEXT, -- Why the imaging is needed
  priority VARCHAR(50) DEFAULT 'routine', -- 'routine', 'urgent', 'stat', 'low'
  is_time_sensitive BOOLEAN DEFAULT FALSE,
  time_sensitive_deadline TIMESTAMP,
  
  -- Additional information
  previous_studies TEXT, -- Reference to previous imaging
  special_instructions TEXT,
  contrast_required BOOLEAN DEFAULT FALSE,
  contrast_allergy BOOLEAN DEFAULT FALSE,
  
  -- Submission tracking
  submitted_by_email VARCHAR(255), -- Email of person who submitted
  submitted_by_name VARCHAR(255),
  submission_method VARCHAR(50) DEFAULT 'web', -- 'web', 'api', 'email'
  api_key_id INTEGER, -- If submitted via API
  
  -- Processing
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  converted_to_order_id INTEGER REFERENCES orders(id), -- If converted to an order
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
CREATE INDEX IF NOT EXISTS idx_requisitions_requisition_number ON requisitions(requisition_number);
CREATE INDEX IF NOT EXISTS idx_requisitions_submitted_by ON requisitions(submitted_by_email);
CREATE INDEX IF NOT EXISTS idx_requisitions_created_at ON requisitions(created_at);

-- Create API keys table for external system integration
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  organization_name VARCHAR(255),
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  allowed_ips TEXT[], -- Optional IP whitelist
  rate_limit_per_hour INTEGER DEFAULT 100,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_requisitions_updated_at ON requisitions;
CREATE TRIGGER update_requisitions_updated_at
    BEFORE UPDATE ON requisitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate requisition numbers
CREATE OR REPLACE FUNCTION generate_requisition_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.requisition_number IS NULL OR NEW.requisition_number = '' THEN
        NEW.requisition_number := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('requisitions_id_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_requisition_number_trigger
    BEFORE INSERT ON requisitions
    FOR EACH ROW
    EXECUTE FUNCTION generate_requisition_number();
