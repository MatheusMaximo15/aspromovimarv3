# Guia de Configuração: Vercel Blob Storage

Este guia te ajudará a configurar o Vercel Blob Storage e fazer deploy do aplicativo.

## 🚀 Passo a Passo

### 1. Criar Blob Store no Vercel

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Selecione seu projeto (aspromovimar)
3. Vá em **Storage** → **Create Database**
4. Selecione **Blob**
5. Nome sugerido: `aspromovimar-storage`
6. Clique em **Create**
7. Copie o **Token** que aparecerá (começa com `vercel_blob_rw_`)

### 2. Configurar Variável de Ambiente no Vercel

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Configure:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Cole o token copiado no passo anterior
   - **Environments:** Selecione **Production**, **Preview** e **Development**
4. Clique em **Save**

### 3. Migrar Dados Existentes (Local)

Se você tem dados existentes em arquivos JSON locais, execute:

```bash
# 1. Criar arquivo .env na raiz do projeto
echo "BLOB_READ_WRITE_TOKEN=seu_token_aqui" > .env

# 2. Executar migração
npm run migrate
```

Você verá:
```
🚀 Iniciando migração para Vercel Blob...

✅ Migrados X eventos
✅ Migradas X notícias
✅ Migradas X inscrições
✅ Migrados X beneficiários

✨ Migração concluída!
```

### 4. Deploy no Vercel

#### Opção A: Deploy Automático (Git)

Se seu projeto está conectado ao Git:

```bash
git add .
git commit -m "Migrar para Vercel Blob Storage"
git push
```

O Vercel fará deploy automático.

#### Opção B: Deploy Manual (Vercel CLI)

```bash
npm install -g vercel
vercel --prod
```

### 5. Verificar Deploy

1. Aguarde o deploy completar (1-2 minutos)
2. Acesse seu site no Vercel
3. Faça login no painel admin
4. Tente criar um novo evento
5. ✅ Sucesso! O erro "read-only file system" não deve mais aparecer

## 📋 Checklist de Verificação

- [ ] Blob Store criado no Vercel
- [ ] Token copiado
- [ ] Variável `BLOB_READ_WRITE_TOKEN` configurada no Vercel
- [ ] Dados migrados (se necessário)
- [ ] Código atualizado commitado
- [ ] Deploy realizado
- [ ] Teste de criação/edição/exclusão de evento funcionando

## 🔧 Troubleshooting

### Erro: "BLOB_READ_WRITE_TOKEN não configurado"

**Solução:** Certifique-se de que configurou a variável de ambiente no Vercel (Passo 2).

### Erro: "Blob não encontrado"

**Solução:** Execute o script de migração (`npm run migrate`) para criar os blobs iniciais.

### Erro: "Invalid token"

**Solução:** Verifique se copiou o token completo. Ele deve começar com `vercel_blob_rw_`.

### Deploy não atualizou

**Solução:**
1. Verifique se o commit foi feito
2. Verifique se o push foi bem-sucedido
3. No dashboard do Vercel, vá em **Deployments** e veja o status

## 📊 Monitoramento

Após o deploy, você pode monitorar:

1. **Usage:** Vercel Dashboard → Storage → Blob → Usage
2. **Logs:** Vercel Dashboard → Deployments → [Latest] → Logs

## 🔄 Rollback

Se algo der errado:

1. No dashboard do Vercel, vá em **Deployments**
2. Encontre o deploy anterior que funcionava
3. Clique em **...** → **Promote to Production**

Os dados permanecem salvos no Blob Storage mesmo após rollback.

## 💾 Backup

Para fazer backup dos dados:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Listar blobs
vercel blob ls --token seu_token_aqui

# Download de um blob específico
curl -o eventos-backup.json "URL_DO_BLOB"
```

## 📝 Notas Importantes

- **Gratuito:** Vercel Blob é gratuito até 500GB de armazenamento
- **Performance:** Primeira requisição pode ser lenta (cold start), depois fica rápido
- **Backup:** Considere fazer backup periódico dos dados
- **Logs:** Os logs do servidor mostrarão operações de leitura/escrita dos blobs

## ✅ Próximos Passos Após Deploy

1. Teste todas as funcionalidades:
   - [ ] Criar evento
   - [ ] Editar evento
   - [ ] Deletar evento
   - [ ] Criar notícia
   - [ ] Inscrições de usuários
   - [ ] Painel admin

2. Monitore os logs inicialmente para ver se há erros

3. Considere implementar:
   - Backup automático dos blobs
   - Monitoramento de uso de storage
   - Cache para melhorar performance

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Vercel
2. Verifique o console do navegador (F12)
3. Teste localmente primeiro (`npm run dev`)
4. Consulte a documentação: https://vercel.com/docs/storage/vercel-blob
