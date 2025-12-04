-- =====================================================
-- OBBA AÇAÍ - SCHEMA DO BANCO DE DADOS SUPABASE
-- =====================================================
-- Execute este script completo no SQL Editor do Supabase
-- =====================================================

-- 1. CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GRUPOS DE OPÇÕES (complementos, sabores, etc)
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  min INTEGER NOT NULL DEFAULT 0,
  max INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OPÇÕES DENTRO DOS GRUPOS
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RELAÇÃO N:N entre PRODUTOS e GRUPOS
CREATE TABLE IF NOT EXISTS product_group_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, group_id)
);

-- 6. CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('DELIVERY', 'PICKUP')),
  address TEXT,
  payment_method TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  items_summary TEXT,
  full_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivery', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CONFIGURAÇÕES GLOBAIS (apenas 1 linha)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Obba Açaí',
  logo_url TEXT,
  banner_url TEXT,
  whatsapp_number TEXT,
  store_status TEXT DEFAULT 'open' CHECK (store_status IN ('open', 'closed')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_only BOOLEAN DEFAULT false,
  opening_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Inserir configurações padrão
INSERT INTO settings (id, store_name, store_status, delivery_fee, delivery_only, opening_hours)
VALUES (
  1,
  'Obba Açaí',
  'open',
  5.00,
  false,
  '[
    {"dayOfWeek": 0, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 1, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 2, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 3, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 4, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 5, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 6, "open": "14:00", "close": "23:00", "enabled": true}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_options_group ON product_options(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code) WHERE active = true;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_group_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS - LEITURA PÚBLICA
-- =====================================================

-- Categorias
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Produtos
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- Grupos
DROP POLICY IF EXISTS "Public read product_groups" ON product_groups;
CREATE POLICY "Public read product_groups" ON product_groups FOR SELECT USING (true);

-- Opções
DROP POLICY IF EXISTS "Public read product_options" ON product_options;
CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);

-- Relações produto-grupo
DROP POLICY IF EXISTS "Public read product_group_relations" ON product_group_relations;
CREATE POLICY "Public read product_group_relations" ON product_group_relations FOR SELECT USING (true);

-- Configurações
DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Cupons (apenas ativos)
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (active = true);

-- =====================================================
-- POLÍTICAS - ESCRITA PÚBLICA (TEMPORÁRIO)
-- =====================================================
-- ATENÇÃO: Estas políticas permitem escrita sem autenticação
-- Ideal para desenvolvimento e testes
-- TODO: Remover estas políticas e adicionar autenticação em produção

DROP POLICY IF EXISTS "Public insert categories" ON categories;
CREATE POLICY "Public insert categories" ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update categories" ON categories;
CREATE POLICY "Public update categories" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete categories" ON categories;
CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert products" ON products;
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update products" ON products;
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete products" ON products;
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert product_groups" ON product_groups;
CREATE POLICY "Public insert product_groups" ON product_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update product_groups" ON product_groups;
CREATE POLICY "Public update product_groups" ON product_groups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete product_groups" ON product_groups;
CREATE POLICY "Public delete product_groups" ON product_groups FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert product_options" ON product_options;
CREATE POLICY "Public insert product_options" ON product_options FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update product_options" ON product_options;
CREATE POLICY "Public update product_options" ON product_options FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete product_options" ON product_options;
CREATE POLICY "Public delete product_options" ON product_options FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert product_group_relations" ON product_group_relations;
CREATE POLICY "Public insert product_group_relations" ON product_group_relations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete product_group_relations" ON product_group_relations;
CREATE POLICY "Public delete product_group_relations" ON product_group_relations FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert coupons" ON coupons;
CREATE POLICY "Public insert coupons" ON coupons FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update coupons" ON coupons;
CREATE POLICY "Public update coupons" ON coupons FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete coupons" ON coupons;
CREATE POLICY "Public delete coupons" ON coupons FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read orders" ON orders;
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update orders" ON orders;
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update settings" ON settings;
CREATE POLICY "Public update settings" ON settings FOR UPDATE USING (true);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_groups_updated_at ON product_groups;
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON product_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_options_updated_at ON product_options;
CREATE TRIGGER update_product_options_updated_at BEFORE UPDATE ON product_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FINALIZADO! ✅
-- =====================================================

SELECT 'Schema criado com sucesso! ✅' AS status;

-- Add display_order to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

