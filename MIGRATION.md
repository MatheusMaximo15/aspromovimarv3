# Guia de Migração para Banco de Dados

Este documento descreve como migrar o sistema ASPROMOVIMAR do armazenamento em JSON para um banco de dados real.

## Índice
1. [Visão Geral](#visão-geral)
2. [Opções de Banco de Dados](#opções-de-banco-de-dados)
3. [Migração para PostgreSQL](#migração-para-postgresql)
4. [Migração para MongoDB](#migração-para-mongodb)
5. [Migração para Supabase](#migração-para-supabase)
6. [Checklist de Migração](#checklist-de-migração)

## Visão Geral

O projeto foi desenvolvido com uma arquitetura em camadas que isola o acesso a dados através do `BeneficiarioRepository`. Isso significa que a migração para um banco de dados real requer alterações **apenas** na camada de dados (`src/data/beneficiarioRepository.js`), mantendo intactos:

- Controllers (`src/api/controllers/`)
- Services (`src/services/`)
- Rotas (`src/api/routes/`)
- Frontend (`public/`)

### Arquivos Afetados pela Migração

1. `src/data/beneficiarioRepository.js` - **PRINCIPAL** - Implementação do repositório
2. `src/config/config.js` - Configurações de conexão
3. `package.json` - Adicionar dependências do banco
4. Novo arquivo de migration/schema (dependendo do banco escolhido)

## Opções de Banco de Dados

### PostgreSQL
**Recomendado para:** Projetos que precisam de relacionamentos complexos, integridade referencial e transações ACID.

**Vantagens:**
- Robusto e confiável
- Suporte completo a SQL
- Ótimo para dados estruturados
- Excelente comunidade

**Desvantagens:**
- Requer servidor dedicado
- Curva de aprendizado moderada

### MongoDB
**Recomendado para:** Projetos que precisam de flexibilidade no schema e escalabilidade horizontal.

**Vantagens:**
- Esquema flexível
- Fácil de escalar
- Trabalha nativamente com JSON
- Cloud Atlas gratuito

**Desvantagens:**
- Menos adequado para relacionamentos complexos
- Consistência eventual em alguns casos

### Supabase
**Recomendado para:** Projetos que querem PostgreSQL + Backend as a Service.

**Vantagens:**
- PostgreSQL gerenciado
- API REST automática
- Autenticação integrada
- Tier gratuito generoso
- Dashboard web

**Desvantagens:**
- Dependência de serviço externo
- Menos controle sobre infraestrutura

## Migração para PostgreSQL

### 1. Instalar Dependências

```bash
npm install pg
```

### 2. Configurar Conexão

Edite `src/config/config.js`:

```javascript
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  auth: {
    admin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'aspromovimar2025'
    }
  },

  database: {
    type: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aspromovimar',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true'
  },

  app: {
    name: 'ASPROMOVIMAR',
    fullName: 'Associação de Proprietários e Moradores do Vila Maria Regina',
    bairro: 'Vila Maria Regina'
  }
};
```

### 3. Criar Schema do Banco

Crie o arquivo `src/database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS beneficiarios (
  id UUID PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(11) NOT NULL,
  numero_pessoas_residencia INTEGER NOT NULL CHECK (numero_pessoas_residencia > 0),
  situacao_atual TEXT NOT NULL,
  comprovante_residencia_url TEXT,
  email VARCHAR(255),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status_inscricao VARCHAR(20) DEFAULT 'pendente' CHECK (status_inscricao IN ('pendente', 'aprovado', 'reprovado')),
  acao VARCHAR(100) DEFAULT 'Mesa Brasil 2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_beneficiarios_cpf ON beneficiarios(cpf);
CREATE INDEX idx_beneficiarios_status ON beneficiarios(status_inscricao);
CREATE INDEX idx_beneficiarios_acao ON beneficiarios(acao);
```

### 4. Reescrever o Repository

Substitua o conteúdo de `src/data/beneficiarioRepository.js`:

```javascript
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class BeneficiarioRepository {
  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false
    });
  }

  async getAllBeneficiarios() {
    const result = await this.pool.query(
      'SELECT * FROM beneficiarios ORDER BY data_cadastro DESC'
    );
    return result.rows;
  }

  async createBeneficiario(beneficiarioData) {
    const existingByCPF = await this.findBeneficiarioByCPF(beneficiarioData.cpf);
    if (existingByCPF) {
      throw new Error('CPF já cadastrado');
    }

    const id = uuidv4();
    const query = `
      INSERT INTO beneficiarios (
        id, nome_completo, cpf, endereco, telefone,
        numero_pessoas_residencia, situacao_atual,
        comprovante_residencia_url, email, acao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      id,
      beneficiarioData.nome_completo,
      beneficiarioData.cpf,
      beneficiarioData.endereco,
      beneficiarioData.telefone,
      beneficiarioData.numero_pessoas_residencia,
      beneficiarioData.situacao_atual,
      beneficiarioData.comprovante_residencia_url,
      beneficiarioData.email,
      beneficiarioData.acao || 'Mesa Brasil 2025'
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findBeneficiarioByCPF(cpf) {
    const result = await this.pool.query(
      'SELECT * FROM beneficiarios WHERE cpf = $1',
      [cpf]
    );
    return result.rows[0];
  }

  async findBeneficiarioById(id) {
    const result = await this.pool.query(
      'SELECT * FROM beneficiarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async updateBeneficiario(id, updateData) {
    const beneficiario = await this.findBeneficiarioById(id);
    if (!beneficiario) {
      throw new Error('Beneficiário não encontrado');
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = fields.map((field, index) =>
      `${field} = $${index + 2}`
    ).join(', ');

    const query = `
      UPDATE beneficiarios
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  async deleteBeneficiario(id) {
    const result = await this.pool.query(
      'DELETE FROM beneficiarios WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Beneficiário não encontrado');
    }

    return true;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new BeneficiarioRepository();
```

### 5. Migrar Dados Existentes

Crie o script `src/scripts/migrate-json-to-postgres.js`:

```javascript
const fs = require('fs').promises;
const repository = require('../data/beneficiarioRepository');

async function migrate() {
  try {
    const jsonData = await fs.readFile('./data/beneficiarios.json', 'utf-8');
    const beneficiarios = JSON.parse(jsonData);

    console.log(`Migrando ${beneficiarios.length} registros...`);

    for (const beneficiario of beneficiarios) {
      try {
        await repository.createBeneficiario(beneficiario);
        console.log(`✓ Migrado: ${beneficiario.nome_completo}`);
      } catch (error) {
        console.error(`✗ Erro ao migrar ${beneficiario.nome_completo}:`, error.message);
      }
    }

    console.log('Migração concluída!');
    await repository.close();
    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
```

Execute a migração:
```bash
node src/scripts/migrate-json-to-postgres.js
```

## Migração para MongoDB

### 1. Instalar Dependências

```bash
npm install mongodb
```

### 2. Configurar Conexão

Edite `src/config/config.js`:

```javascript
module.exports = {
  // ... outras configs ...

  database: {
    type: 'mongodb',
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'aspromovimar'
  }
};
```

### 3. Reescrever o Repository

```javascript
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class BeneficiarioRepository {
  constructor() {
    this.client = new MongoClient(config.database.url);
    this.dbName = config.database.dbName;
    this.collectionName = 'beneficiarios';
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection(this.collectionName);

      await this.collection.createIndex({ cpf: 1 }, { unique: true });
      await this.collection.createIndex({ status_inscricao: 1 });

      this.connected = true;
    }
  }

  async getAllBeneficiarios() {
    await this.connect();
    return await this.collection.find({}).sort({ data_cadastro: -1 }).toArray();
  }

  async createBeneficiario(beneficiarioData) {
    await this.connect();

    const existingByCPF = await this.findBeneficiarioByCPF(beneficiarioData.cpf);
    if (existingByCPF) {
      throw new Error('CPF já cadastrado');
    }

    const newBeneficiario = {
      id: uuidv4(),
      ...beneficiarioData,
      data_cadastro: new Date().toISOString(),
      status_inscricao: 'pendente',
      acao: beneficiarioData.acao || 'Mesa Brasil 2025',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.collection.insertOne(newBeneficiario);
    return newBeneficiario;
  }

  async findBeneficiarioByCPF(cpf) {
    await this.connect();
    return await this.collection.findOne({ cpf });
  }

  async findBeneficiarioById(id) {
    await this.connect();
    return await this.collection.findOne({ id });
  }

  async updateBeneficiario(id, updateData) {
    await this.connect();

    const result = await this.collection.findOneAndUpdate(
      { id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error('Beneficiário não encontrado');
    }

    return result.value;
  }

  async deleteBeneficiario(id) {
    await this.connect();

    const result = await this.collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      throw new Error('Beneficiário não encontrado');
    }

    return true;
  }

  async close() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}

module.exports = new BeneficiarioRepository();
```

## Migração para Supabase

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### 2. Criar Tabela no Supabase

No dashboard do Supabase, execute:

```sql
-- Mesmo schema do PostgreSQL
CREATE TABLE beneficiarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(11) NOT NULL,
  numero_pessoas_residencia INTEGER NOT NULL CHECK (numero_pessoas_residencia > 0),
  situacao_atual TEXT NOT NULL,
  comprovante_residencia_url TEXT,
  email VARCHAR(255),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_inscricao VARCHAR(20) DEFAULT 'pendente',
  acao VARCHAR(100) DEFAULT 'Mesa Brasil 2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX idx_beneficiarios_cpf ON beneficiarios(cpf);
CREATE INDEX idx_beneficiarios_status ON beneficiarios(status_inscricao);
```

### 3. Configurar

```javascript
module.exports = {
  // ... outras configs ...

  database: {
    type: 'supabase',
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  }
};
```

### 4. Reescrever o Repository

```javascript
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class BeneficiarioRepository {
  constructor() {
    this.supabase = createClient(
      config.database.url,
      config.database.anonKey
    );
  }

  async getAllBeneficiarios() {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createBeneficiario(beneficiarioData) {
    const existingByCPF = await this.findBeneficiarioByCPF(beneficiarioData.cpf);
    if (existingByCPF) {
      throw new Error('CPF já cadastrado');
    }

    const newBeneficiario = {
      id: uuidv4(),
      ...beneficiarioData,
      data_cadastro: new Date().toISOString(),
      status_inscricao: 'pendente',
      acao: beneficiarioData.acao || 'Mesa Brasil 2025'
    };

    const { data, error } = await this.supabase
      .from('beneficiarios')
      .insert([newBeneficiario])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findBeneficiarioByCPF(cpf) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data;
  }

  async findBeneficiarioById(id) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data;
  }

  async updateBeneficiario(id, updateData) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Beneficiário não encontrado');
      }
      throw new Error(error.message);
    }

    return data;
  }

  async deleteBeneficiario(id) {
    const { error } = await this.supabase
      .from('beneficiarios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}

module.exports = new BeneficiarioRepository();
```

## Checklist de Migração

### Antes da Migração

- [ ] Fazer backup completo do arquivo `data/beneficiarios.json`
- [ ] Documentar quantidade de registros existentes
- [ ] Testar conexão com o banco de dados escolhido
- [ ] Criar banco de dados e schema
- [ ] Configurar variáveis de ambiente

### Durante a Migração

- [ ] Atualizar `package.json` com dependências
- [ ] Atualizar `src/config/config.js`
- [ ] Substituir `src/data/beneficiarioRepository.js`
- [ ] Criar e executar script de migração de dados
- [ ] Testar todas as rotas da API
- [ ] Verificar integridade dos dados migrados

### Após a Migração

- [ ] Testar cadastro de novo beneficiário
- [ ] Testar filtros e buscas
- [ ] Testar atualização de status
- [ ] Testar exportação CSV
- [ ] Verificar performance
- [ ] Configurar backup automático do banco
- [ ] Atualizar documentação
- [ ] Remover ou arquivar `data/beneficiarios.json`

## Variáveis de Ambiente Recomendadas

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3000
HOST=localhost
NODE_ENV=production

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aspromovimar
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_SSL=false

# OU MongoDB
MONGODB_URL=mongodb://localhost:27017
DB_NAME=aspromovimar

# OU Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
```

Instale dotenv:
```bash
npm install dotenv
```

No início do `src/server.js`, adicione:
```javascript
require('dotenv').config();
```

## Conclusão

Após seguir este guia, seu sistema estará usando um banco de dados real, mantendo toda a funcionalidade existente. A arquitetura em camadas do projeto garante que a migração seja localizada e não afete o restante do código.

Para dúvidas ou problemas durante a migração, consulte a documentação oficial do banco de dados escolhido.
