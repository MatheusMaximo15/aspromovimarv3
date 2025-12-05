require('dotenv').config();
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN não configurado');
    console.error('');
    console.error('Configure a variável de ambiente criando um arquivo .env na raiz do projeto:');
    console.error('BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx');
    console.error('');
    console.error('Ou defina a variável de ambiente no terminal:');
    console.error('export BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx');
    process.exit(1);
  }

  console.log('🚀 Iniciando migração para Vercel Blob...\n');

  // Migrar eventos
  try {
    const eventosPath = path.join(__dirname, '../data/eventos.json');
    if (fs.existsSync(eventosPath)) {
      const eventos = JSON.parse(fs.readFileSync(eventosPath, 'utf-8'));
      const eventosJson = JSON.stringify(eventos, null, 2);

      await put('eventos.json', eventosJson, {
        token,
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`✅ Migrados ${eventos.length} eventos`);
    } else {
      console.log('⚠️  eventos.json não encontrado, criando vazio');
      await put('eventos.json', '[]', { token, access: 'public', contentType: 'application/json' });
    }
  } catch (error) {
    console.error('❌ Erro ao migrar eventos:', error.message);
  }

  // Migrar notícias
  try {
    const noticiasPath = path.join(__dirname, '../data/noticias.json');
    if (fs.existsSync(noticiasPath)) {
      const noticias = JSON.parse(fs.readFileSync(noticiasPath, 'utf-8'));
      const noticiasJson = JSON.stringify(noticias, null, 2);

      await put('noticias.json', noticiasJson, {
        token,
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`✅ Migradas ${noticias.length} notícias`);
    } else {
      console.log('⚠️  noticias.json não encontrado, criando vazio');
      await put('noticias.json', '[]', { token, access: 'public', contentType: 'application/json' });
    }
  } catch (error) {
    console.error('❌ Erro ao migrar notícias:', error.message);
  }

  // Migrar inscrições
  try {
    const inscricoesPath = path.join(__dirname, '../data/inscricoes.json');
    if (fs.existsSync(inscricoesPath)) {
      const inscricoes = JSON.parse(fs.readFileSync(inscricoesPath, 'utf-8'));
      const inscricoesJson = JSON.stringify(inscricoes, null, 2);

      await put('inscricoes.json', inscricoesJson, {
        token,
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`✅ Migradas ${inscricoes.length} inscrições`);
    } else {
      console.log('⚠️  inscricoes.json não encontrado, criando vazio');
      await put('inscricoes.json', '[]', { token, access: 'public', contentType: 'application/json' });
    }
  } catch (error) {
    console.error('❌ Erro ao migrar inscrições:', error.message);
  }

  // Migrar beneficiários
  try {
    const beneficiariosPath = path.join(__dirname, '../data/beneficiarios.json');
    if (fs.existsSync(beneficiariosPath)) {
      const beneficiarios = JSON.parse(fs.readFileSync(beneficiariosPath, 'utf-8'));
      const beneficiariosJson = JSON.stringify(beneficiarios, null, 2);

      await put('beneficiarios.json', beneficiariosJson, {
        token,
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`✅ Migrados ${beneficiarios.length} beneficiários`);
    } else {
      console.log('⚠️  beneficiarios.json não encontrado, criando vazio');
      await put('beneficiarios.json', '[]', { token, access: 'public', contentType: 'application/json' });
    }
  } catch (error) {
    console.error('❌ Erro ao migrar beneficiários:', error.message);
  }

  console.log('\n✨ Migração concluída!');
  console.log('');
  console.log('Próximos passos:');
  console.log('1. Configure BLOB_READ_WRITE_TOKEN nas variáveis de ambiente do Vercel');
  console.log('2. Faça deploy do código atualizado');
  console.log('3. Teste criação/edição/exclusão de eventos no painel admin');
}

migrate().catch(console.error);
