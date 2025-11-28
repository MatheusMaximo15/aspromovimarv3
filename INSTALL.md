# Guia de Instalação - ASPROMOVIMAR

## Pré-requisitos: Instalar Node.js

O projeto precisa do Node.js para funcionar. Siga os passos abaixo:

### Passo 1: Baixar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS (Long Term Support)** - recomendada
3. Escolha o instalador para Windows (arquivo `.msi`)

### Passo 2: Instalar Node.js

1. Execute o arquivo baixado (ex: `node-v20.x.x-x64.msi`)
2. Clique em "Next" em todas as etapas
3. **IMPORTANTE:** Marque a opção "Automatically install the necessary tools" se aparecer
4. Clique em "Install"
5. Aguarde a instalação completar
6. Clique em "Finish"

### Passo 3: Verificar Instalação

Abra um **novo** PowerShell ou Prompt de Comando e execute:

```powershell
node --version
```

Deve aparecer algo como: `v20.x.x`

```powershell
npm --version
```

Deve aparecer algo como: `10.x.x`

**Se não funcionar:**
- Feche TODAS as janelas do PowerShell/CMD
- Abra uma NOVA janela do PowerShell
- Tente novamente

Se ainda não funcionar, reinicie o computador.

## Instalação do Projeto ASPROMOVIMAR

### Passo 1: Navegar até a pasta do projeto

```powershell
cd C:\Users\adm.mmaximo.ICG\Desktop\ASPROMOVIMAR
```

### Passo 2: Instalar dependências

```powershell
npm install
```

Aguarde alguns minutos. Você verá algo como:

```
added 57 packages, and audited 58 packages in 10s
```

### Passo 3: Iniciar o servidor

```powershell
npm start
```

Você verá:

```
===========================================
  ASPROMOVIMAR - Sistema Web
===========================================
  Servidor rodando em: http://localhost:3000
  Ambiente: development
===========================================
```

### Passo 4: Acessar o sistema

Abra seu navegador e acesse:

**Página Inicial:**
```
http://localhost:3000
```

**Cadastro:**
```
http://localhost:3000/cadastro
```

**Administração:**
```
http://localhost:3000/admin
```

Login admin:
- Usuário: `admin`
- Senha: `aspromovimar2025`

## Solução de Problemas

### Erro: "npm não é reconhecido"

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**
1. Instale o Node.js seguindo o Passo 1 acima
2. Feche e abra novamente o PowerShell
3. Se não funcionar, reinicie o computador

### Erro: "Cannot find module"

**Causa:** Dependências não foram instaladas.

**Solução:**
```powershell
npm install
```

### Erro: "EACCES" ou "Permission denied"

**Causa:** Falta de permissão.

**Solução:**
1. Feche o PowerShell
2. Clique com botão direito no PowerShell
3. Selecione "Executar como administrador"
4. Tente novamente

### Erro: "Port 3000 is already in use"

**Causa:** Porta 3000 já está sendo usada.

**Solução 1:** Encerre o processo que está usando a porta
```powershell
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F
```

**Solução 2:** Use outra porta
```powershell
$env:PORT=3001
npm start
```

### Erro: "Cannot read property of undefined"

**Causa:** Arquivo de dados não foi criado.

**Solução:**
```powershell
echo "[]" > data/beneficiarios.json
```

### O navegador mostra "Cannot GET /"

**Causa:** Servidor não está rodando.

**Solução:**
1. Verifique se o comando `npm start` está rodando
2. Veja se há erros no terminal
3. Reinicie o servidor (Ctrl+C e depois `npm start`)

## Estrutura de Arquivos

Após a instalação, você terá:

```
ASPROMOVIMAR/
├── node_modules/           # Dependências (criado após npm install)
├── src/                    # Código-fonte do backend
│   ├── server.js
│   ├── config/
│   ├── data/
│   ├── services/
│   ├── api/
│   └── utils/
├── public/                 # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── cadastro.html
│   ├── admin.html
│   ├── css/
│   └── js/
├── data/                   # Dados JSON
│   └── beneficiarios.json
├── package.json            # Configuração do projeto
├── package-lock.json       # Lock de dependências
├── README.md               # Documentação completa
├── MIGRATION.md            # Guia de migração para BD
├── QUICKSTART.md           # Guia rápido
└── INSTALL.md              # Este arquivo
```

## Comandos Úteis

### Iniciar servidor

```powershell
npm start
```

### Iniciar com auto-reload (desenvolvimento)

Primeiro instale o nodemon globalmente (uma vez):
```powershell
npm install -g nodemon
```

Depois use:
```powershell
npm run dev
```

### Parar o servidor

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

### Ver versões instaladas

```powershell
node --version
npm --version
```

### Limpar cache do npm (se houver problemas)

```powershell
npm cache clean --force
```

### Reinstalar dependências

```powershell
# Deletar node_modules
Remove-Item -Recurse -Force node_modules

# Reinstalar
npm install
```

### Ver processos Node rodando

```powershell
Get-Process node
```

### Matar processos Node

```powershell
Stop-Process -Name node -Force
```

## Configuração de Desenvolvimento

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
HOST=localhost
NODE_ENV=development
```

Instale dotenv:
```powershell
npm install dotenv
```

### Editor de Código Recomendado

**Visual Studio Code** (Gratuito)
- Download: https://code.visualstudio.com/
- Extensões recomendadas:
  - ESLint
  - Prettier
  - Live Server
  - JavaScript (ES6) code snippets

### Abrir projeto no VS Code

```powershell
code .
```

## Primeiro Teste

### 1. Criar um cadastro de teste

1. Acesse: http://localhost:3000/cadastro
2. Preencha o formulário:
   - Nome: João da Silva
   - CPF: 12345678909
   - Endereço: Rua Teste, 123, Vila Maria Regina
   - Telefone: 21987654321
   - Nº Pessoas: 4
   - Situação: Família em situação de vulnerabilidade
3. Clique em "Enviar Cadastro"

### 2. Ver no painel admin

1. Acesse: http://localhost:3000/admin
2. Login: `admin` / `aspromovimar2025`
3. Veja o cadastro criado
4. Teste aprovar/reprovar
5. Teste exportar CSV

### 3. Verificar dados salvos

Abra o arquivo:
```
C:\Users\adm.mmaximo.ICG\Desktop\ASPROMOVIMAR\data\beneficiarios.json
```

Você verá o cadastro em formato JSON.

## Próximos Passos

Após instalar e testar:

1. ✅ Leia o [README.md](README.md) para entender o projeto completo
2. ✅ Consulte o [QUICKSTART.md](QUICKSTART.md) para uso rápido
3. ✅ Veja o [MIGRATION.md](MIGRATION.md) quando for migrar para banco de dados
4. ✅ Customize as cores e textos conforme necessário
5. ✅ Altere a senha admin em `src/config/config.js`

## Suporte

### Documentação do Node.js
- https://nodejs.org/docs/

### Documentação do Express
- https://expressjs.com/

### Tutoriais em Português
- https://developer.mozilla.org/pt-BR/
- https://nodejs.org/pt-br/

### Problemas Comuns
- Stack Overflow: https://stackoverflow.com/
- GitHub Issues do projeto

## Backup dos Dados

Para fazer backup dos cadastros:

```powershell
# Copiar arquivo de dados
Copy-Item data\beneficiarios.json data\beneficiarios-backup-$(Get-Date -Format "yyyyMMdd-HHmmss").json

# Listar backups
Get-ChildItem data\beneficiarios-backup-*.json
```

## Atualizar Dependências (Futuro)

```powershell
# Ver dependências desatualizadas
npm outdated

# Atualizar dependências
npm update

# Atualizar para versões major (com cuidado)
npm install express@latest
```

---

**Projeto desenvolvido para ASPROMOVIMAR - Associação de Proprietários e Moradores do Vila Maria Regina**

Se tiver dúvidas, consulte a documentação completa no [README.md](README.md)
