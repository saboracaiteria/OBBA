-- Adicionar coluna min_order_value à tabela coupons
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS min_order_value DECIMAL(10, 2);
