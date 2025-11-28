# Guia Rápido - ASPROMOVIMAR

## Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

### 3. Acessar o Sistema

Abra seu navegador em:

- **Página Inicial:** http://localhost:3000
- **Cadastro:** http://localhost:3000/cadastro
- **Administração:** http://localhost:3000/admin

### 4. Login Administrativo

- **Usuário:** admin
- **Senha:** aspromovimar2025

## Estrutura de Arquivos Principais

```
ASPROMOVIMAR/
├── src/
│   ├── server.js                           # Servidor principal
│   ├── config/config.js                    # Configurações
│   ├── data/beneficiarioRepository.js      # Acesso a dados
│   ├── services/beneficiarioService.js     # Lógica de negócio
│   ├── api/
│   │   ├── controllers/beneficiarioController.js
│   │   ├── routes/beneficiarioRoutes.js
│   │   └── middleware/auth.js
│   └── utils/validators.js                 # Validações
├── public/
│   ├── index.html                          # Página inicial
│   ├── cadastro.html                       # Formulário de cadastro
│   ├── admin.html                          # Painel administrativo
│   ├── css/styles.css                      # Estilos
│   └── js/
│       ├── cadastro.js                     # JS do formulário
│       └── admin.js                        # JS do admin
└── data/
    └── beneficiarios.json                  # Dados (JSON)
```

## Funcionalidades Implementadas

### Para Moradores
- ✅ Visualizar informações sobre a Ação Mesa Brasil
- ✅ Preencher formulário de cadastro
- ✅ Validação de CPF em tempo real
- ✅ Formatação automática de CPF e telefone
- ✅ Mensagens de sucesso/erro

### Para Administradores
- ✅ Login com autenticação
- ✅ Dashboard com estatísticas
- ✅ Listagem de todos os cadastros
- ✅ Filtros por nome, CPF e status
- ✅ Aprovar/reprovar cadastros
- ✅ Ver detalhes completos
- ✅ Exportar para CSV

## Rotas da API

### Públicas

- `POST /api/beneficiarios` - Criar cadastro

### Administrativas (requer autenticação)

- `GET /api/beneficiarios` - Listar cadastros
- `GET /api/beneficiarios/cpf/:cpf` - Buscar por CPF
- `PUT /api/beneficiarios/:id` - Atualizar cadastro
- `GET /api/beneficiarios/export/csv` - Exportar CSV

## Teste Rápido

### 1. Criar um Cadastro de Teste

Acesse http://localhost:3000/cadastro e preencha:

- **Nome:** João da Silva
- **CPF:** 12345678909 (será formatado automaticamente)
- **Endereço:** Rua Teste, 123, Vila Maria Regina
- **Telefone:** 21987654321
- **Nº Pessoas:** 4
- **Situação Atual:** Família em situação de vulnerabilidade necessitando de itens básicos
- **Email:** joao@teste.com (opcional)

### 2. Acessar Painel Admin

1. Acesse http://localhost:3000/admin
2. Login: admin / aspromovimar2025
3. Veja o cadastro criado
4. Teste os filtros e botões de aprovar/reprovar
5. Exporte para CSV

## Personalização Rápida

### Alterar Credenciais Admin

Edite [src/config/config.js](src/config/config.js):

```javascript
auth: {
  admin: {
    username: 'seu_usuario',
    password: 'sua_senha'
  }
}
```

### Alterar Porta do Servidor

Edite [src/config/config.js](src/config/config.js):

```javascript
server: {
  port: 8080,  // ou qualquer porta desejada
  host: 'localhost'
}
```

Ou use variável de ambiente:

```bash
PORT=8080 npm start
```

### Cores do Site

Edite [public/css/styles.css](public/css/styles.css):

```css
:root {
  --primary-color: #2563eb;      /* Azul principal */
  --secondary-color: #10b981;    /* Verde secundário */
  --text-dark: #1f2937;          /* Texto escuro */
  /* ... */
}
```

## Solução de Problemas

### Erro: "Cannot find module"

```bash
npm install
```

### Porta 3000 já em uso

```bash
PORT=3001 npm start
```

### Erro ao acessar beneficiarios.json

Certifique-se de que o arquivo `data/beneficiarios.json` existe e contém `[]`:

```bash
echo "[]" > data/beneficiarios.json
```

### Cadastro não aparece no admin

1. Verifique se o servidor está rodando
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique se o arquivo `data/beneficiarios.json` foi criado

## Próximos Passos

1. ✅ Sistema funcionando com JSON
2. 📋 Testar todas as funcionalidades
3. 📋 Migrar para banco de dados (veja [MIGRATION.md](MIGRATION.md))
4. 📋 Adicionar upload de arquivos
5. 📋 Implementar notificações por email
6. 📋 Criar novas ações além do Mesa Brasil

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Iniciar com auto-reload (desenvolvimento)
npm run dev

# Verificar arquivos
ls -la

# Ver conteúdo do JSON
cat data/beneficiarios.json

# Backup dos dados
cp data/beneficiarios.json data/beneficiarios-backup-$(date +%Y%m%d).json
```

## Documentação Completa

Para mais detalhes, consulte:

- [README.md](README.md) - Documentação completa do projeto
- [MIGRATION.md](MIGRATION.md) - Guia de migração para banco de dados

## Suporte

Para dúvidas ou problemas:

1. Verifique a documentação completa no README.md
2. Veja os logs do servidor no terminal
3. Abra o console do navegador (F12) para ver erros de frontend

---

**Desenvolvido para ASPROMOVIMAR - Associação de Proprietários e Moradores do Vila Maria Regina**
