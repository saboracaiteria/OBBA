-- =====================================================
-- MIGRATION: FORCE OPEN / CLOSE / AUTO
-- =====================================================

-- 1. Remover a restrição antiga que só aceitava 'open' ou 'closed'
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_store_status_check;

-- 2. Adicionar nova restrição aceitando 'auto'
ALTER TABLE settings ADD CONSTRAINT settings_store_status_check 
CHECK (store_status IN ('open', 'closed', 'auto'));

-- 3. Atualizar o status atual para 'auto' (padrão seguro)
UPDATE settings SET store_status = 'auto' WHERE id = 1;

SELECT 'Migração concluída! Agora você pode usar o modo Automático. ✅' AS status;
