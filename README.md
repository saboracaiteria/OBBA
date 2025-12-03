# 🍇 Obba Açaí - Sistema de Delivery

Sistema completo de delivery para açaí com painel administrativo, gerenciamento de produtos, pedidos e integração com impressora Bluetooth.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Changelog](#-changelog)

## ✨ Características

### Para Clientes
- 🛒 **Carrinho de Compras** - Interface intuitiva para adicionar produtos
- 🎨 **Personalização** - Customização de produtos com adicionais
- 💰 **Cupons de Desconto** - Sistema de cupons promocionais
- ⏰ **Horários** - Verificação automática de horário de funcionamento
- 📱 **PWA** - Funciona como aplicativo mobile (Android)
- 🔄 **Offline** - Suporte para uso offline com cache local

### Para Administradores
- 📊 **Relatórios** - Estatísticas de vendas e análises financeiras
- 🖨️ **Impressão** - Integração com impressoras térmicas Bluetooth
- 📦 **Produtos** - Gerenciamento completo de produtos e categorias
- 🎁 **Cupons** - Criação e gerenciamento de cupons
- ⚙️ **Configurações** - Controle de horários, taxas e status da loja
- 👥 **Pedidos** - Acompanhamento em tempo real de pedidos

## 🛠️ Tecnologias

- **React 19** - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Capacitor** - Framework para apps nativos
- **Lucide React** - Ícones
- **TailwindCSS** - Estilização (via classes utilitárias)

## 📥 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd obba-açaí-delivery
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente** (se necessário)
```bash
# Crie um arquivo .env.local se precisar de configurações específicas
```

## 🚀 Uso

### Desenvolvimento
```bash
npm run dev
```
Acesse: `http://localhost:5173`

### Build de Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

### Android (Capacitor)

1. **Sincronizar com Android**
```bash
npx cap sync android
```

2. **Abrir no Android Studio**
```bash
npx cap open android
```

3. **Build APK**
- Abra o projeto no Android Studio
- Build → Build Bundle(s) / APK(s) → Build APK(s)

## 📁 Estrutura do Projeto

```
obba-açaí-delivery/
├── src/
│   ├── App.tsx                    # Aplicação principal
│   ├── PrinterContext.tsx         # Context de impressão
│   ├── PrinterSettingsPage.tsx    # Config. impressoras
│   ├── ReportsPage.tsx            # Relatórios
│   ├── CategoriesPage.tsx         # Gerenc. categorias
│   ├── ProductsPage.tsx           # Gerenc. produtos
│   ├── constants.ts               # Constantes
│   └── types.ts                   # Tipos TypeScript
├── android/                       # Projeto Android
├── dist/                          # Build de produção
├── public/                        # Arquivos públicos
├── capacitor.config.ts            # Config. Capacitor
├── vite.config.ts                 # Config. Vite
├── package.json                   # Dependências
├── CHANGELOG.md                   # Histórico de alterações
└── README.md                      # Este arquivo
```

## 📝 Changelog

Veja [CHANGELOG.md](./CHANGELOG.md) para detalhes sobre as últimas alterações.

### Principais Funcionalidades Recentes
- ✅ Sistema de impressão Bluetooth
- ✅ Relatórios financeiros avançados
- ✅ Fechamento automático da loja por horário
- ✅ Modal de produtos customizável
- ✅ Sistema de cupons de desconto
- ✅ Suporte PWA e Android

## 🔐 Acesso Administrativo

### Senhas Padrão
- **Admin:** `123`
- **Funcionário:** `777`

⚠️ **Importante:** Altere as senhas em produção!

## 📱 Funcionalidades Mobile

- ✅ Instalável como PWA
- ✅ Build para Android via Capacitor
- ✅ Persistência local de dados
- ✅ Suporte offline
- ✅ Integração com hardware (impressora Bluetooth)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 👨‍💻 Desenvolvedor

**@_nildoxz**

## 📄 Licença

Este projeto é proprietário.

---

**Última Atualização:** Dezembro 2025
