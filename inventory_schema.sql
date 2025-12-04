-- =====================================================
-- OBBA AÇAÍ - SCHEMA DE ESTOQUE
-- =====================================================

-- 1. FORNECEDORES
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ITENS DE ESTOQUE (Vinculado a Produtos)
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- 3. COMPRAS / ENTRADAS
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  items JSONB, -- Detalhes dos itens comprados: [{ productId, quantity, cost }]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Simplificado para dev)
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public insert suppliers" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update suppliers" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Public delete suppliers" ON suppliers FOR DELETE USING (true);

CREATE POLICY "Public read stock_items" ON stock_items FOR SELECT USING (true);
CREATE POLICY "Public insert stock_items" ON stock_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update stock_items" ON stock_items FOR UPDATE USING (true);
CREATE POLICY "Public delete stock_items" ON stock_items FOR DELETE USING (true);

CREATE POLICY "Public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Public insert purchases" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update purchases" ON purchases FOR UPDATE USING (true);
CREATE POLICY "Public delete purchases" ON purchases FOR DELETE USING (true);
