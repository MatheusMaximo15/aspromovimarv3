# Guia de Migração - JSON para Banco de Dados

Este guia explica como migrar o armazenamento de dados do formato JSON para um banco de dados real, sem precisar alterar a API ou o frontend.

## 🎯 Vantagens da Arquitetura Atual

Graças à camada de abstração de dados ([src/data/beneficiarioRepository.js](src/data/beneficiarioRepository.js)), a migração é simples e não requer alterações em:

- ✅ Controllers da API
- ✅ Rotas
- ✅ Frontend (HTML/CSS/JS)
- ✅ Validações de negócio

Apenas o arquivo `beneficiarioRepository.js` precisa ser modificado!

## 📊 Opções de Banco de Dados

### 1. PostgreSQL (Recomendado)

**Vantagens:**
- Robusto e confiável
- Excelente para dados estruturados
- Suporte a JSON nativo
- Gratuito e open-source

**Instalação:**
```bash
npm install pg
```

**Schema SQL:**
```sql
CREATE TABLE beneficiarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  numero_pessoas_residencia INTEGER NOT NULL,
  situacao_atual TEXT NOT NULL,
  comprovante_residencia_url TEXT,
  email VARCHAR(255),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_inscricao VARCHAR(20) DEFAULT 'pendente',
  acao VARCHAR(100) DEFAULT 'Mesa Brasil 2025',
  CHECK (status_inscricao IN ('pendente', 'aprovado', 'reprovado'))
);

CREATE INDEX idx_cpf ON beneficiarios(cpf);
CREATE INDEX idx_status ON beneficiarios(status_inscricao);
```

**Implementação:**
```javascript
// src/data/beneficiarioRepository.js
const { Pool } = require('pg');

class BeneficiarioRepository {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'aspromovimar',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });
  }

  async getAllBeneficiarios() {
    const result = await this.pool.query('SELECT * FROM beneficiarios ORDER BY data_cadastro DESC');
    return result.rows;
  }

  async createBeneficiario(beneficiarioData) {
    // Verificar se CPF já existe
    const existingCPF = await this.pool.query(
      'SELECT id FROM beneficiarios WHERE cpf = $1',
      [beneficiarioData.cpf]
    );

    if (existingCPF.rows.length > 0) {
      throw new Error('CPF já cadastrado');
    }

    const query = `
      INSERT INTO beneficiarios (
        nome_completo, cpf, endereco, telefone, numero_pessoas_residencia,
        situacao_atual, comprovante_residencia_url, email, acao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      beneficiarioData.nome_completo,
      beneficiarioData.cpf,
      beneficiarioData.endereco,
      beneficiarioData.telefone,
      beneficiarioData.numero_pessoas_residencia,
      beneficiarioData.situacao_atual,
      beneficiarioData.comprovante_residencia_url || '',
      beneficiarioData.email || null,
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

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'data_cadastro' && key !== 'cpf') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return beneficiario;
    }

    values.push(id);
    const query = `
      UPDATE beneficiarios
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteBeneficiario(id) {
    const result = await this.pool.query(
      'DELETE FROM beneficiarios WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Beneficiário não encontrado');
    }

    return true;
  }
}

module.exports = new BeneficiarioRepository();
```

### 2. Supabase (PostgreSQL na nuvem)

**Vantagens:**
- PostgreSQL gerenciado na nuvem
- Fácil setup
- Plano gratuito generoso
- Interface web para gerenciamento

**Instalação:**
```bash
npm install @supabase/supabase-js
```

**Implementação:**
```javascript
// src/data/beneficiarioRepository.js
const { createClient } = require('@supabase/supabase-js');

class BeneficiarioRepository {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }

  async getAllBeneficiarios() {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createBeneficiario(beneficiarioData) {
    const { data: existing } = await this.supabase
      .from('beneficiarios')
      .select('id')
      .eq('cpf', beneficiarioData.cpf)
      .single();

    if (existing) {
      throw new Error('CPF já cadastrado');
    }

    const { data, error } = await this.supabase
      .from('beneficiarios')
      .insert([{
        ...beneficiarioData,
        acao: beneficiarioData.acao || 'Mesa Brasil 2025'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findBeneficiarioByCPF(cpf) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findBeneficiarioById(id) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateBeneficiario(id, updateData) {
    const { data, error } = await this.supabase
      .from('beneficiarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Beneficiário não encontrado');
      }
      throw error;
    }

    return data;
  }

  async deleteBeneficiario(id) {
    const { error } = await this.supabase
      .from('beneficiarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = new BeneficiarioRepository();
```

### 3. MongoDB

**Vantagens:**
- NoSQL flexível
- Fácil de escalar
- Bom para dados semi-estruturados

**Instalação:**
```bash
npm install mongodb
```

**Implementação:**
```javascript
// src/data/beneficiarioRepository.js
const { MongoClient, ObjectId } = require('mongodb');

class BeneficiarioRepository {
  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    this.dbName = 'aspromovimar';
    this.collectionName = 'beneficiarios';
    this.connect();
  }

  async connect() {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection(this.collectionName);

      // Criar índice único para CPF
      await this.collection.createIndex({ cpf: 1 }, { unique: true });
    }
  }

  async getAllBeneficiarios() {
    await this.connect();
    return await this.collection
      .find()
      .sort({ data_cadastro: -1 })
      .toArray();
  }

  async createBeneficiario(beneficiarioData) {
    await this.connect();

    try {
      const result = await this.collection.insertOne({
        ...beneficiarioData,
        data_cadastro: new Date().toISOString(),
        status_inscricao: 'pendente',
        acao: beneficiarioData.acao || 'Mesa Brasil 2025'
      });

      return await this.collection.findOne({ _id: result.insertedId });
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('CPF já cadastrado');
      }
      throw error;
    }
  }

  async findBeneficiarioByCPF(cpf) {
    await this.connect();
    return await this.collection.findOne({ cpf });
  }

  async findBeneficiarioById(id) {
    await this.connect();
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async updateBeneficiario(id, updateData) {
    await this.connect();

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error('Beneficiário não encontrado');
    }

    return result.value;
  }

  async deleteBeneficiario(id) {
    await this.connect();

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Beneficiário não encontrado');
    }

    return true;
  }
}

module.exports = new BeneficiarioRepository();
```

## 🔧 Passo a Passo da Migração

### 1. Escolha o Banco de Dados
Decida qual banco de dados usar baseado nas necessidades do projeto.

### 2. Instale as Dependências
```bash
npm install <pacote-do-banco>
```

### 3. Configure Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=aspromovimar
DB_PORT=5432
```

Instale o dotenv:
```bash
npm install dotenv
```

E adicione no início do [server.js](src/server.js):
```javascript
require('dotenv').config();
```

### 4. Crie o Schema do Banco
Execute o script SQL para criar as tabelas (se PostgreSQL/MySQL).

### 5. Substitua o beneficiarioRepository.js
Substitua o conteúdo de [src/data/beneficiarioRepository.js](src/data/beneficiarioRepository.js) pela implementação do banco escolhido.

### 6. Migre os Dados Existentes (Opcional)
Se já existirem dados no JSON, crie um script de migração:

```javascript
// scripts/migrate-json-to-db.js
const fs = require('fs').promises;
const repository = require('../src/data/beneficiarioRepository');

async function migrate() {
  const jsonData = await fs.readFile('./data/beneficiarios.json', 'utf-8');
  const beneficiarios = JSON.parse(jsonData);

  for (const beneficiario of beneficiarios) {
    try {
      await repository.createBeneficiario(beneficiario);
      console.log(`✓ Migrado: ${beneficiario.nome_completo}`);
    } catch (error) {
      console.error(`✗ Erro ao migrar ${beneficiario.nome_completo}:`, error.message);
    }
  }

  console.log('\n✅ Migração concluída!');
  process.exit(0);
}

migrate();
```

Execute:
```bash
node scripts/migrate-json-to-db.js
```

### 7. Teste a Aplicação
Teste todas as funcionalidades para garantir que tudo funciona:
- Criar cadastro
- Listar cadastros
- Filtrar cadastros
- Atualizar status
- Exportar CSV

### 8. Remova o JSON (Opcional)
Após confirmar que tudo funciona, você pode remover o arquivo JSON:
```bash
# Faça backup primeiro!
mv data/beneficiarios.json data/beneficiarios.json.backup
```

## ✅ Checklist de Migração

- [ ] Escolher banco de dados
- [ ] Instalar dependências
- [ ] Configurar variáveis de ambiente
- [ ] Criar schema/tabelas
- [ ] Implementar novo beneficiarioRepository.js
- [ ] Testar conexão com o banco
- [ ] Migrar dados existentes (se houver)
- [ ] Testar todas as funcionalidades
- [ ] Atualizar documentação
- [ ] Fazer backup do JSON
- [ ] Deploy em produção

## 🔒 Boas Práticas

1. **Sempre use variáveis de ambiente** para credenciais
2. **Faça backup** antes de migrar
3. **Teste em ambiente de desenvolvimento** antes de produção
4. **Use connection pooling** para melhor performance
5. **Implemente logs** para facilitar debugging
6. **Configure backups automáticos** do banco de dados

## 📚 Recursos Adicionais

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Node.js pg library](https://node-postgres.com/)

---

**Nota:** Com a arquitetura modular implementada, a migração não afetará o funcionamento da API ou do frontend!
