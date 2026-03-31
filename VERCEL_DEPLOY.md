# 🚀 Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

### 1. Instalar o Vercel CLI
```bash
# Via npm
npm install -g vercel

# Ou via yarn
yarn global add vercel
```

### 2. Criar conta no Vercel
- Acesse [vercel.com](https://vercel.com)
- Faça login com GitHub, GitLab ou email
- Instale o Vercel CLI se solicitado

## 🏗️ Configuração do Projeto

### 3. Criar arquivo `vercel.json`
```json
{
  "version": 2,
  "name": "dashboard-maikito-san",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/reposicao",
      "dest": "/reposicao.html"
    },
    {
      "src": "/reposicoes-todas",
      "dest": "/reposicoes-todas.html"
    },
    {
      "src": "/reposicao-canceladas",
      "dest": "/reposicao-canceladas.html"
    },
    {
      "src": "/script.js",
      "dest": "/script.js"
    },
    {
      "src": "/styles.css",
      "dest": "/styles.css"
    },
    {
      "src": "/whatsapp-service.js",
      "dest": "/whatsapp-service.js"
    },
    {
      "src": "/reposicao.js",
      "dest": "/reposicao.js"
    },
    {
      "src": "/reposicoes-todas.js",
      "dest": "/reposicoes-todas.js"
    },
    {
      "src": "/reposicao-canceladas.js",
      "dest": "/reposicao-canceladas.js"
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 4. Deploy via CLI
```bash
# Na pasta do projeto
cd dashboard_full

# Login no Vercel
vercel login

# Deploy inicial
vercel

# Deploy para produção
vercel --prod
```

## 💾 PERSISTÊNCIA DE DADOS

### ⚠️ **IMPORTANTE: localStorage não persiste em produção!**

O seu projeto atual usa `localStorage` que:
- ✅ **Funciona localmente** (no seu computador)
- ❌ **NÃO persiste** no Vercel (cada usuário tem seu próprio localStorage)
- ❌ **Perde dados** ao limpar cache/trocar de navegador

### 🔧 **Soluções de Banco de Dados no Vercel**

#### Opção 1: Vercel KV (Recomendado)
```bash
# Instalar
npm install @vercel/kv

# Uso no JavaScript
import { kv } from '@vercel/kv';

// Salvar dados
await kv.set('agendamentos', JSON.stringify(agendamentos));

// Ler dados
const agendamentos = await kv.get('agendamentos');
```

#### Opção 2: Supabase (Gratis)
```bash
# Criar projeto em supabase.com
# Instalar
npm install @supabase/supabase-js

# Configurar
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// CRUD operations
const { data, error } = await supabase
  .from('agendamentos')
  .select('*');
```

#### Opção 3: Firebase (Google)
```bash
# Instalar
npm install firebase

# Configurar
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

## 🛠️ Migração para Banco de Dados

### Estrutura Sugerida:
```javascript
// Tabela: agendamentos
{
  id: string,
  aluno: string,
  professor: string,
  turma: string,
  data: string,
  horario: string,
  motivo: string,
  email: string,
  telefone: string,
  status: 'pendente' | 'confirmado' | 'realizado',
  dataCriacao: string,
  whatsappEnviado: boolean
}

// Tabela: agendamentos_cancelados
{
  id: string,
  ...todos os campos acima,
  motivoCancelamento: string,
  dataCancelamento: string
}
```

### Exemplo com Vercel KV:
```javascript
// reposicao-db.js
class ReposicaoDB {
  constructor() {
    this.kv = null;
  }

  async init() {
    if (typeof window !== 'undefined') {
      // Fallback para localStorage local
      this.useLocalStorage = true;
    } else {
      // Usar Vercel KV em produção
      this.kv = require('@vercel/kv').kv;
      this.useLocalStorage = false;
    }
  }

  async salvarAgendamentos(agendamentos) {
    if (this.useLocalStorage) {
      localStorage.setItem('agendamentos_reposicao', JSON.stringify(agendamentos));
    } else {
      await this.kv.set('agendamentos_reposicao', JSON.stringify(agendamentos));
    }
  }

  async carregarAgendamentos() {
    if (this.useLocalStorage) {
      const salvos = localStorage.getItem('agendamentos_reposicao');
      return salvos ? JSON.parse(salvos) : [];
    } else {
      const salvos = await this.kv.get('agendamentos_reposicao');
      return salvos ? JSON.parse(salvos) : [];
    }
  }
}
```

## 🎯 **Recomendação Final**

1. **Deploy inicial** com localStorage (para testar)
2. **Migrar** para Vercel KV ou Supabase
3. **Configurar** ambiente de produção
4. **Testar** persistência de dados

## 📞 **Suporte**

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Supabase](https://supabase.com/docs)
- [Firebase](https://firebase.google.com/docs)

---

**Próximos passos:**
1. ✅ Criar conta Vercel
2. ✅ Instalar Vercel CLI
3. ✅ Criar vercel.json
4. ✅ Fazer deploy
5. 🔄 Migrar para banco de dados
6. 🎉 Aplicação em produção!
