-- Add active column to products, categories, product_groups and product_options tables
-- for emergency deactivation feature

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Categories  
ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Product Groups (Add-ons)
ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Product Options
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
