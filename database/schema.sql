-- Island Radiology Queue Management System Database Schema

-- Sites (Hospitals)
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities (Equipment at each site)
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    equipment_type VARCHAR(50) NOT NULL, -- 'CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, equipment_type)
);

-- Radiologists
CREATE TABLE IF NOT EXISTS radiologists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'radiologist', -- 'radiologist', 'admin'
    work_hours_start TIME,
    work_hours_end TIME,
    work_days VARCHAR(50), -- e.g., 'Mon-Fri', 'Mon-Sat', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Radiologist specialties
CREATE TABLE IF NOT EXISTS radiologist_specialties (
    id SERIAL PRIMARY KEY,
    radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    proficiency_level INTEGER DEFAULT 5, -- 1-10 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(radiologist_id, specialty)
);

-- Radiologist assignments to sites
CREATE TABLE IF NOT EXISTS radiologist_sites (
    id SERIAL PRIMARY KEY,
    radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE CASCADE,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(radiologist_id, site_id)
);

-- Schedules (Calendar)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE CASCADE,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'vacation', 'sick'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(radiologist_id, site_id, date)
);

-- Orders (Imaging requests) - Enhanced with priority, specialty, time sensitivity
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(255),
    patient_name VARCHAR(255),
    ordering_physician VARCHAR(255),
    physician_specialty VARCHAR(100),
    site_id INTEGER REFERENCES sites(id),
    assigned_site_id INTEGER REFERENCES sites(id),
    order_type VARCHAR(50) NOT NULL, -- 'CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'
    body_part VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'routine', -- 'routine', 'urgent', 'stat', 'low'
    priority_score INTEGER DEFAULT 5, -- 1-10 scale
    specialty_required VARCHAR(100), -- 'neuroradiology', 'musculoskeletal', 'cardiac', 'pediatric', 'general', etc.
    is_time_sensitive BOOLEAN DEFAULT FALSE,
    time_sensitive_deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'completed', 'cancelled'
    scheduled_date DATE,
    scheduled_time TIME,
    routing_reason TEXT, -- Why this site was chosen
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Combined orders (when multiple orders are combined)
CREATE TABLE IF NOT EXISTS combined_orders (
    id SERIAL PRIMARY KEY,
    combined_date DATE,
    combined_time TIME,
    site_id INTEGER REFERENCES sites(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS combined_order_items (
    id SERIAL PRIMARY KEY,
    combined_order_id INTEGER REFERENCES combined_orders(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time estimates (for each scan type)
CREATE TABLE IF NOT EXISTS time_estimates (
    id SERIAL PRIMARY KEY,
    radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL, -- 'CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'
    average_perform_time INTEGER NOT NULL, -- minutes
    average_read_time INTEGER NOT NULL, -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(radiologist_id, scan_type)
);

-- Site capacity and current load tracking
CREATE TABLE IF NOT EXISTS site_capacity (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,
    total_capacity INTEGER, -- Total slots available
    booked_slots INTEGER DEFAULT 0,
    available_slots INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, date, equipment_type)
);

-- Order routing history (for analytics)
CREATE TABLE IF NOT EXISTS order_routing_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    original_site_id INTEGER REFERENCES sites(id),
    routed_site_id INTEGER REFERENCES sites(id),
    routing_reason TEXT,
    routing_score DECIMAL,
    routed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_site ON orders(assigned_site_id);
CREATE INDEX IF NOT EXISTS idx_orders_time_sensitive ON orders(is_time_sensitive, time_sensitive_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_radiologist ON schedules(radiologist_id);
CREATE INDEX IF NOT EXISTS idx_radiologist_specialties ON radiologist_specialties(specialty);

