-- =====================================================
-- OBBA AÇAÍ - STORAGE SETUP
-- =====================================================
-- Execute este script no SQL Editor do Supabase para
-- configurar o bucket de imagens.
-- =====================================================

-- 1. Criar o bucket 'product-images' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 3. Criar Políticas de Segurança (RLS) para o Storage

-- Permitir leitura pública (qualquer um pode ver as imagens)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Permitir upload público (para facilitar o desenvolvimento)
-- Em produção, você deve restringir isso apenas para admins
CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' );

-- Permitir atualização pública
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' );

-- Permitir deleção pública
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' );

-- =====================================================
-- FINALIZADO! ✅
-- =====================================================

SELECT 'Storage configurado com sucesso! ✅' AS status;
