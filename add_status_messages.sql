-- Adicionar campos para mensagens de status editáveis
ALTER TABLE settings ADD COLUMN IF NOT EXISTS closed_message TEXT DEFAULT '🔴 Loja Fechada';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS open_message TEXT DEFAULT '🟢 Aberto até às 23:00';
