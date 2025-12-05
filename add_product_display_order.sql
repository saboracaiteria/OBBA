-- Add display_order column to products table for manual product sorting
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display order based on creation time (optional)
UPDATE products
SET display_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) - 1 as row_num
  FROM products
) sub
WHERE products.id = sub.id AND products.display_order = 0;
