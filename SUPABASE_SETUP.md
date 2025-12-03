# 🚀 Guia de Setup do Supabase

## Passo 1: Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado) ou email
4. Clique em **"New Project"**
5. Preencha:
   - **Name:** `obba-acai` (ou nome de sua preferência)
   - **Database Password:** *crie uma senha forte e ANOTE*
   - **Region:** `South America (São Paulo)` para melhor latência
   - **Pricing Plan:** `Free` (0$/mês)
6. Clique em **"Create new project"**
7. Aguarde 2-3 minutos até o projeto estar pronto

---

## Passo 2: Copiar Chaves de API

Após o projeto ser criado:

1. No menu lateral, clique em **⚙️ Settings**
2. Clique em **API**
3. Você verá:
   - **Project URL:** `https://xxxxxxxxx.supabase.co`
   - **anon/public key:** `eyJhbGci...` (chave longa)

4. **COPIE ESSAS DUAS INFORMAÇÕES!**

---

## Passo 3: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Cole as informações copiadas:

```env
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...sua-chave-completa-aqui
```

3. **SALVE O ARQUIVO**

---

## Passo 4: Criar Tabelas no Banco de Dados

1. No Supabase, clique em **🗄️ SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem de sucesso ✅

---

## Passo 5: Verificar Tabelas Criadas

1. Clique em **📊 Table Editor** no menu lateral
2. Você deve ver todas as tabelas:
   - ✅ categories
   - ✅ product_groups
   - ✅ product_options
   - ✅ products
   - ✅ product_group_relations
   - ✅ coupons
   - ✅ orders
   - ✅ settings

---

## Passo 6: Testar a Conexão

1. Volte para o terminal
2. Execute: `npm run dev`
3. Abra o navegador em `http://localhost:5173`
4. **Se aparecer o app normalmente, está funcionando!** ✅

---

## 🔒 Segurança: Row Level Security (RLS)

As políticas de segurança já foram configuradas automaticamente pelo script SQL:

- ✅ **Leitura pública:** Todos podem ver produtos, categorias, configurações
- ✅ **Escrita restrita:** Apenas requisições autenticadas podem modificar dados
- ⚠️ **Importante:** Por enquanto, qualquer pessoa pode criar/editar através do painel admin (senha 123/777)

### Para produção (recomendado):
- Implementar autenticação real (email/senha)
- Restringir modificações apenas para usuários autenticados
- Podemos fazer isso na próxima fase!

---

## 📸 Storage para Imagens (Opcional)

Se quiser hospedar imagens de produtos no Supabase (Essencial para o upload funcionar):

1. No Supabase, clique em **🗄️ SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `supabase-storage.sql`
4. Cole no editor SQL
5. Clique em **"Run"**
6. Aguarde a mensagem de sucesso ✅

---

## 🆘 Problemas Comuns

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave completa (é bem longa!)
- ✅ Verifique se não tem espaços extras no `.env.local`
- ✅ Reinicie o servidor (`npm run dev`)

### Erro: "relation does not exist"
- ✅ Execute o script SQL novamente
- ✅ Verifique se todas as tabelas foram criadas

### App carrega mas não mostra produtos
- ✅ Normal! O banco está vazio
- ✅ Vou criar um script de migração para transferir seus dados locais

---

## ✅ Checklist Final

- [ ] Conta Supabase criada
- [ ] Projeto criado (região São Paulo)
- [ ] Chaves copiadas para `.env.local`
- [ ] Script SQL executado com sucesso
- [ ] Todas as 8 tabelas visíveis no Table Editor
- [ ] App rodando sem erros

**Quando completar tudo, me avise para testarmos juntos!** 🚀
