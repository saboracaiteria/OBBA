-- Add logo_shape column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS logo_shape VARCHAR(10) DEFAULT 'circle' CHECK (logo_shape IN ('circle', 'rectangle'));

-- Update existing row to have default value
UPDATE settings SET logo_shape = 'circle' WHERE logo_shape IS NULL;
