-- Migration: Add procedures and radiologist procedure times

-- Procedures table
CREATE TABLE IF NOT EXISTS procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'
    body_part VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category)
);

-- Radiologist procedure times (average reporting time for each procedure)
CREATE TABLE IF NOT EXISTS radiologist_procedure_times (
    id SERIAL PRIMARY KEY,
    radiologist_id INTEGER REFERENCES radiologists(id) ON DELETE CASCADE,
    procedure_id INTEGER REFERENCES procedures(id) ON DELETE CASCADE,
    average_reporting_time INTEGER NOT NULL, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(radiologist_id, procedure_id)
);

-- Insert common radiology procedures
INSERT INTO procedures (name, description, category, body_part) VALUES
-- CT Procedures
('Chest CT', 'Computed Tomography of the chest', 'CT', 'Chest'),
('Head CT', 'Computed Tomography of the head', 'CT', 'Head'),
('Abdomen CT', 'Computed Tomography of the abdomen', 'CT', 'Abdomen'),
('Pelvis CT', 'Computed Tomography of the pelvis', 'CT', 'Pelvis'),
('Neck CT', 'Computed Tomography of the neck', 'CT', 'Neck'),
('Spine CT - Cervical', 'CT of cervical spine', 'CT', 'Spine - Cervical'),
('Spine CT - Thoracic', 'CT of thoracic spine', 'CT', 'Spine - Thoracic'),
('Spine CT - Lumbar', 'CT of lumbar spine', 'CT', 'Spine - Lumbar'),
('CT Angiography - Chest', 'CT angiography of chest vessels', 'CT', 'Chest'),
('CT Angiography - Head/Neck', 'CT angiography of head and neck vessels', 'CT', 'Head/Neck'),
('CT Angiography - Abdomen', 'CT angiography of abdominal vessels', 'CT', 'Abdomen'),
('CT Urogram', 'CT examination of urinary tract', 'CT', 'Abdomen/Pelvis'),
('CT Colonography', 'Virtual colonoscopy', 'CT', 'Abdomen'),
('CT Enterography', 'CT examination of small bowel', 'CT', 'Abdomen'),
('High Resolution Chest CT', 'HRCT of the chest', 'CT', 'Chest'),

-- MRI Procedures
('Brain MRI', 'Magnetic Resonance Imaging of the brain', 'MRI', 'Head'),
('Spine MRI - Cervical', 'MRI of cervical spine', 'MRI', 'Spine - Cervical'),
('Spine MRI - Thoracic', 'MRI of thoracic spine', 'MRI', 'Spine - Thoracic'),
('Spine MRI - Lumbar', 'MRI of lumbar spine', 'MRI', 'Spine - Lumbar'),
('Knee MRI', 'MRI of the knee', 'MRI', 'Knee'),
('Shoulder MRI', 'MRI of the shoulder', 'MRI', 'Shoulder'),
('Hip MRI', 'MRI of the hip', 'MRI', 'Hip'),
('Ankle MRI', 'MRI of the ankle', 'MRI', 'Ankle'),
('Wrist MRI', 'MRI of the wrist', 'MRI', 'Wrist'),
('Elbow MRI', 'MRI of the elbow', 'MRI', 'Elbow'),
('Abdomen MRI', 'MRI of the abdomen', 'MRI', 'Abdomen'),
('Pelvis MRI', 'MRI of the pelvis', 'MRI', 'Pelvis'),
('Breast MRI', 'MRI of the breast', 'MRI', 'Breast'),
('Cardiac MRI', 'MRI of the heart', 'MRI', 'Chest'),
('MR Angiography - Head/Neck', 'MRA of head and neck', 'MRI', 'Head/Neck'),
('MR Angiography - Chest', 'MRA of chest', 'MRI', 'Chest'),
('MR Angiography - Abdomen', 'MRA of abdomen', 'MRI', 'Abdomen'),
('MR Enterography', 'MRI examination of small bowel', 'MRI', 'Abdomen'),
('MR Cholangiopancreatography (MRCP)', 'MRI of biliary and pancreatic ducts', 'MRI', 'Abdomen'),
('Prostate MRI', 'MRI of the prostate', 'MRI', 'Pelvis'),

-- Ultrasound Procedures
('Abdominal Ultrasound', 'Ultrasound of the abdomen', 'Ultrasound', 'Abdomen'),
('Pelvic Ultrasound', 'Ultrasound of the pelvis', 'Ultrasound', 'Pelvis'),
('Obstetric Ultrasound', 'Pregnancy ultrasound', 'Ultrasound', 'Pelvis'),
('Transvaginal Ultrasound', 'TV ultrasound', 'Ultrasound', 'Pelvis'),
('Testicular Ultrasound', 'Ultrasound of testicles', 'Ultrasound', 'Pelvis'),
('Thyroid Ultrasound', 'Ultrasound of thyroid', 'Ultrasound', 'Neck'),
('Carotid Doppler', 'Ultrasound of carotid arteries', 'Ultrasound', 'Neck'),
('Renal Ultrasound', 'Ultrasound of kidneys', 'Ultrasound', 'Abdomen'),
('Liver Ultrasound', 'Ultrasound of liver', 'Ultrasound', 'Abdomen'),
('Gallbladder Ultrasound', 'Ultrasound of gallbladder', 'Ultrasound', 'Abdomen'),
('Breast Ultrasound', 'Ultrasound of breast', 'Ultrasound', 'Breast'),
('Echocardiogram', 'Ultrasound of the heart', 'Ultrasound', 'Chest'),
('Lower Extremity Venous Doppler', 'Ultrasound of leg veins', 'Ultrasound', 'Lower Extremity'),
('Upper Extremity Venous Doppler', 'Ultrasound of arm veins', 'Ultrasound', 'Upper Extremity'),
('Arterial Doppler - Lower Extremity', 'Ultrasound of leg arteries', 'Ultrasound', 'Lower Extremity'),
('Arterial Doppler - Upper Extremity', 'Ultrasound of arm arteries', 'Ultrasound', 'Upper Extremity'),

-- X-Ray Procedures
('Chest X-Ray', 'Radiograph of the chest', 'X-Ray', 'Chest'),
('Abdominal X-Ray', 'Radiograph of the abdomen', 'X-Ray', 'Abdomen'),
('Pelvis X-Ray', 'Radiograph of the pelvis', 'X-Ray', 'Pelvis'),
('Skull X-Ray', 'Radiograph of the skull', 'X-Ray', 'Head'),
('Spine X-Ray - Cervical', 'Radiograph of cervical spine', 'X-Ray', 'Spine - Cervical'),
('Spine X-Ray - Thoracic', 'Radiograph of thoracic spine', 'X-Ray', 'Spine - Thoracic'),
('Spine X-Ray - Lumbar', 'Radiograph of lumbar spine', 'X-Ray', 'Spine - Lumbar'),
('Knee X-Ray', 'Radiograph of the knee', 'X-Ray', 'Knee'),
('Ankle X-Ray', 'Radiograph of the ankle', 'X-Ray', 'Ankle'),
('Foot X-Ray', 'Radiograph of the foot', 'X-Ray', 'Foot'),
('Hip X-Ray', 'Radiograph of the hip', 'X-Ray', 'Hip'),
('Shoulder X-Ray', 'Radiograph of the shoulder', 'X-Ray', 'Shoulder'),
('Elbow X-Ray', 'Radiograph of the elbow', 'X-Ray', 'Elbow'),
('Wrist X-Ray', 'Radiograph of the wrist', 'X-Ray', 'Wrist'),
('Hand X-Ray', 'Radiograph of the hand', 'X-Ray', 'Hand'),

-- PET Procedures
('PET-CT - Whole Body', 'PET-CT scan of whole body', 'PET', 'Whole Body'),
('PET-CT - Brain', 'PET-CT scan of brain', 'PET', 'Head'),
('PET-CT - Chest', 'PET-CT scan of chest', 'PET', 'Chest'),
('PET-CT - Abdomen/Pelvis', 'PET-CT scan of abdomen and pelvis', 'PET', 'Abdomen/Pelvis'),
('PET-MRI', 'PET-MRI fusion imaging', 'PET', 'Various')

ON CONFLICT (name, category) DO NOTHING;

