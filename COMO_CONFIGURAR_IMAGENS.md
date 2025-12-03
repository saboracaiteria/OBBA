# 🖼️ Como Configurar as Imagens (Passo a Passo Simples)

Para que você consiga colocar fotos nos produtos, precisamos ativar o "HD virtual" (Storage) no seu banco de dados.

É só seguir estes 3 passos:

### Passo 1: Copie o Código
Copie todo o código abaixo (selecione tudo e aperte `Ctrl+C`):

```sql
-- 1. Criar o bucket 'product-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar regras antigas
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 3. Criar novas regras (Liberar tudo para facilitar)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' );

SELECT 'Tudo pronto! Pode enviar imagens agora. ✅' AS status;
```

### Passo 2: Abra o Supabase
1. Acesse seu painel no [Supabase.com](https://supabase.com/dashboard/projects).
2. Entre no seu projeto (**obba-acai**).
3. No menu lateral esquerdo, clique no ícone **SQL Editor** (parece um terminal `>_`).
4. Clique no botão verde **"New query"** (ou "Blank query").

### Passo 3: Cole e Rode
1. Cole o código que você copiou na área em branco (`Ctrl+V`).
2. Clique no botão **"Run"** (ou `Ctrl+Enter`) no canto inferior direito.
3. Se aparecer a mensagem **"Tudo pronto! Pode enviar imagens agora. ✅"**, DEU CERTO! 🎉

---

### Teste Final
Agora volte no seu aplicativo (painel de produtos) e tente colocar uma foto. Deve funcionar!
