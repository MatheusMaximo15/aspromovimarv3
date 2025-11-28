# ASPROMOVIMAR - Site Institucional

Site institucional da ASPROMOVIMAR (Associação de Proprietários e Moradores do Vila Maria Regina), desenvolvido para gerenciar eventos, ações sociais e comunicação com a comunidade.

## Sobre o Projeto

Este projeto foi desenvolvido para a ASPROMOVIMAR com o objetivo de facilitar a comunicação com os moradores e a gestão de eventos e ações sociais do bairro Vila Maria Regina. O sistema permite que moradores visualizem notícias, se inscrevam em eventos e ações sociais, enquanto administradores gerenciam todo o conteúdo.

### Funcionalidades Principais

- **Site Institucional**: Página inicial com notícias, eventos e ações sociais
- **Sistema de Eventos**: Criação e gestão de eventos da comunidade
- **Ações Sociais**: Gerenciamento de programas sociais (como Mesa Brasil)
- **Inscrições**: Sistema de cadastro para participação em eventos
- **Painel Administrativo**: Gestão completa de conteúdo e inscrições
- **Editor Rico**: Criação de notícias com formatação avançada (negrito, listas, etc.)
- **Página de Notícias Moderna**: Layout imersivo com leitura otimizada e compartilhamento social

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **UUID** - Geração de IDs únicos
- **Express Validator** - Validação de dados
- **Sanitize HTML** - Sanitização de conteúdo rico (prevenção XSS)
- **CORS** - Controle de acesso entre origens

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização com CSS Variables e design responsivo
- **JavaScript (ES6+)** - Vanilla JS sem frameworks
- **Magic UI** - Animações e efeitos visuais
- **Quill.js** - Editor de texto rico para notícias
- **Font Awesome** - Ícones vetoriais

### Armazenamento (Fase Atual)
- **JSON** - Armazenamento em arquivos JSON
- Arquitetura preparada para migração futura para banco de dados

## Estrutura do Projeto

```
ASPROMOVIMAR/
├── src/
│   ├── api/
│   │   ├── controllers/        # Controladores HTTP (Request handlers)
│   │   ├── routes/             # Definição de rotas Express
│   │   └── middleware/         # Autenticação e middlewares
│   ├── services/               # Lógica de negócio e validações
│   ├── data/                   # Camada de acesso a dados (Repositories)
│   ├── config/                 # Configurações do sistema
│   ├── utils/                  # Validadores (CPF, telefone, email)
│   └── server.js               # Servidor Express principal
├── public/
│   ├── css/
│   │   └── styles.css          # Estilos globais
│   ├── js/
│   │   ├── admin.js            # Lógica do painel admin
│   │   ├── cadastro.js         # Lógica do formulário de inscrição
│   │   └── content-loader.js   # Carregamento dinâmico de conteúdo
│   ├── index.html              # Página inicial
│   ├── cadastro.html           # Formulário de inscrição em eventos
│   ├── admin.html              # Painel administrativo
│   └── mesa-brasil.html        # Página específica da ação Mesa Brasil
├── data/
│   ├── eventos.json            # Dados dos eventos
│   ├── noticias.json           # Notícias e comunicados
│   ├── inscricoes.json         # Inscrições em eventos
│   └── beneficiarios.json      # Dados legados do Mesa Brasil
├── nodemon.json                # Configuração do nodemon
├── package.json
├── CLAUDE.md                   # Instruções para Claude Code
└── README.md
```

## Arquitetura

### Padrão Repository

O projeto utiliza o **Repository Pattern** para isolamento da camada de dados:

```
Routes → Controllers → Services → Repositories → JSON Files
```

**Fluxo de dados:**
1. **Routes** - Definem endpoints da API
2. **Controllers** - Lidam com requisições HTTP
3. **Services** - Contêm lógica de negócio e validações
4. **Repositories** - Isolam acesso aos dados (CRUD operations)
5. **JSON Files** - Armazenamento de dados

Este padrão facilita a futura migração para banco de dados, pois apenas a camada Repository precisará ser modificada.

### Entidades Principais

#### 1. Eventos
```json
{
  "id": "uuid",
  "titulo": "string",
  "descricao": "string",
  "data_evento": "YYYY-MM-DD",
  "data_evento_fim": "YYYY-MM-DD | null",
  "horario": "string",
  "local": "string",
  "link": "string | null",
  "ativo": "boolean",
  "proximo_evento": "boolean",
  "acao_social": "boolean",
  "mostrar_botao_inscricao": "boolean",
  "data_criacao": "ISO string",
  "data_atualizacao": "ISO string"
}
```

#### 2. Inscrições
```json
{
  "id": "uuid",
  "evento_id": "uuid",
  "evento_titulo": "string",
  "nome_completo": "string",
  "cpf": "string (somente números)",
  "telefone": "string (somente números)",
  "email": "string | null",
  "endereco": "string",
  "numero_pessoas_residencia": "number | null",
  "observacoes": "string | null",
  "campos_personalizados": "object",
  "status": "pendente | aprovado | reprovado",
  "data_inscricao": "ISO string"
}
```

#### 3. Notícias
```json
{
  "id": "uuid",
  "titulo": "string",
  "descricao": "string (HTML rico suportado)",
  "data": "YYYY-MM-DD",
  "categoria": "string",
  "link": "string | null",
  "ativa": "boolean",
  "data_criacao": "ISO string"
}
```

## API

### Formato de Resposta Padrão

Todas as respostas da API seguem o formato:

```json
{
  "success": true,
  "message": "Mensagem descritiva",
  "data": { }
}
```

### Rotas Públicas

#### Eventos
- `GET /api/eventos` - Listar todos os eventos
- `GET /api/eventos?proximos=true` - Listar próximos eventos
- `GET /api/eventos/:id` - Buscar evento por ID

#### Notícias
- `GET /api/noticias` - Listar todas as notícias ativas

#### Inscrições
- `POST /api/inscricoes` - Criar nova inscrição em evento

### Rotas Administrativas (Requer Autenticação)

#### Eventos
- `POST /api/eventos` - Criar evento
- `PUT /api/eventos/:id` - Atualizar evento
- `DELETE /api/eventos/:id` - Deletar evento

#### Notícias
- `POST /api/noticias` - Criar notícia
- `PUT /api/noticias/:id` - Atualizar notícia
- `DELETE /api/noticias/:id` - Deletar notícia

#### Inscrições
- `GET /api/inscricoes` - Listar inscrições
- `GET /api/inscricoes/estatisticas` - Estatísticas gerais
- `PUT /api/inscricoes/:id` - Atualizar status de inscrição
- `DELETE /api/inscricoes/:id` - Deletar inscrição
- `GET /api/inscricoes/export/csv` - Exportar para CSV

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- NPM

### Passo a Passo

1. Clone ou faça download do projeto

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:

**Para produção:**
```bash
npm start
```

**Para desenvolvimento (com auto-reload):**
```bash
npm run dev
```

4. Acesse o sistema:
- Site: http://localhost:3000
- Inscrições: http://localhost:3000/cadastro
- Admin: http://localhost:3000/admin

## Credenciais de Acesso

### Painel Administrativo
- **Usuário:** admin
- **Senha:** aspromovimar2025

> **IMPORTANTE:** Em produção, altere essas credenciais no arquivo `src/config/config.js`

## Funcionalidades Detalhadas

### Para Moradores

#### Página Inicial
- Visualização de notícias recentes
- Lista de próximos eventos
- Seção de ações sociais ativas
- Design responsivo para mobile

#### Formulário de Inscrição
- Seleção de evento disponível
- Validação de CPF em tempo real
- Máscaras automáticas (CPF, telefone)
- Validações completas no frontend e backend
- Prevenção de inscrições duplicadas (mesmo CPF por evento)

### Para Administradores

#### Dashboard
- Estatísticas de inscrições (total, pendentes, aprovadas, reprovadas)
- Visão geral de eventos e notícias

#### Gestão de Eventos
- Criar/editar/deletar eventos
- Controlar visibilidade (ativo/inativo)
- Definir se aparece em "Próximos Eventos"
- Definir se aparece em "Ações Sociais"
- Opção de botão de inscrição
- Eventos com data de início e fim
- Timezone Brasil (UTC-3) para evitar problemas de data

#### Gestão de Notícias
- Criar/editar/deletar notícias
- Categorização
- Editor de texto rico (Quill.js) para formatação
- Links externos opcionais
- Controle de visibilidade

#### Gestão de Inscrições
- Visualizar todas as inscrições
- Filtrar por evento e status
- Aprovar/reprovar inscrições
- Exportar dados em CSV
- Ver detalhes completos de cada inscrição

## Validações Implementadas

### CPF
- Formato válido
- Dígitos verificadores corretos
- Prevenção de CPFs sequenciais (111.111.111-11)
- Um CPF por evento (permite participar de múltiplos eventos)
- Armazenado sem formatação

### Telefone
- 10 ou 11 dígitos (com DDD)
- Formatação automática no frontend

### Email
- Formato válido (quando preenchido)
- Opcional

### Dados do Evento
- Título: mínimo 3 caracteres
- Descrição: mínimo 10 caracteres
- Data obrigatória
- Checkboxes independentes para controle de exibição

## Regras de Negócio

### Eventos
1. **Evento Ativo**: Controla se o evento é visível no site
2. **Próximo Evento**: Controla se aparece na seção "Próximos Eventos"
3. **Ação Social**: Controla se aparece na seção "Ações Sociais"
4. **Botão de Inscrição**: Adiciona botão destacado na página inicial

Um evento pode:
- Aparecer em ambas seções
- Aparecer apenas em uma seção
- Não aparecer em nenhuma (mas ainda estar ativo)

### Filtragem por Data
- Eventos passados não aparecem em "Próximos Eventos"
- Ações sociais consideram `data_evento_fim` se definida
- Timezone Brasil (UTC-3) para evitar problemas de fuso

### Inscrições
- CPF único por evento
- Status: pendente (padrão), aprovado, reprovado
- Formulário simplificado (não é entrevista)

## Configuração do Nodemon

O arquivo `nodemon.json` está configurado para:
- Monitorar apenas `src/` e `public/`
- Ignorar mudanças em `data/*.json` (evita restart ao salvar dados)
- Monitorar apenas `.js`, `.html`, `.css`

## Regras Importantes

### 1. Ordem de Rotas
Rotas específicas SEMPRE antes de rotas com parâmetros:

```javascript
// ✓ CORRETO
router.get('/api/inscricoes/estatisticas', ...)
router.get('/api/inscricoes/:id', ...)

// ✗ ERRADO - :id vai capturar "estatisticas"
router.get('/api/inscricoes/:id', ...)
router.get('/api/inscricoes/estatisticas', ...)
```

### 2. Caminhos de Arquivo
Use `path.join(__dirname, '../../data/file.json')` ao invés de caminhos relativos.

### 3. Armazenamento de CPF
CPF sempre armazenado SEM formatação (somente números). Formatação apenas para exibição.

### 4. Retornos em Middleware
Sempre use `return` em `next()` e `res.json()` para evitar headers duplicados.

### 5. Formato de API
Use sempre em inglês: `success`, `message`, `data` (não `sucesso`, `mensagem`).

## Segurança

### Implementações Atuais
- Validação de entrada em todas as rotas
- Sanitização de dados
- Autenticação Basic Auth para rotas administrativas
- Validação de CPF único por evento
- CORS configurado
- Prevenção de XSS (via sanitize-html para conteúdo rico)
- Prevenção de SQL Injection (via validações)

### Recomendações para Produção
- [ ] Implementar HTTPS
- [ ] Usar variáveis de ambiente para credenciais
- [ ] Implementar rate limiting
- [ ] Logs de auditoria
- [ ] Migrar para JWT ao invés de Basic Auth
- [ ] Content Security Policy (CSP)
- [ ] Proteção CSRF

## Backup e Manutenção

### Backup dos Dados
Como os dados estão em JSON:
```bash
# Backup manual
cp -r data/ backup/data-$(date +%Y%m%d-%H%M%S)/

# Recomendado: automatizar com cron job
```

### Logs
- Em desenvolvimento: console
- Em produção: usar Winston ou Pino para logs estruturados

## Futuras Melhorias

### Técnicas
- [ ] Migração para PostgreSQL/MongoDB
- [ ] Autenticação JWT
- [ ] Upload de arquivos (comprovantes)
- [ ] Testes automatizados (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] PWA (Progressive Web App)
- [ ] Rate limiting
- [ ] Monitoramento e métricas

### Funcionalidades
- [ ] Área do morador com login
- [ ] Notificações por email/SMS
- [ ] Dashboard com gráficos
- [ ] Sistema de denúncias/sugestões
- [ ] Gestão de contribuições/mensalidades
- [ ] Chat com administradores
- [ ] Calendário interativo de eventos

## Migração para Banco de Dados

O projeto está preparado para migração futura. Apenas a camada `Repository` precisará ser modificada:

1. Criar schemas/models do banco de dados
2. Substituir `_readFile()` e `_writeFile()` por queries
3. Manter a mesma interface pública dos repositories
4. Nenhuma mudança necessária em Services, Controllers ou Frontend

## Guia para Claude Code

Consulte o arquivo [CLAUDE.md](./CLAUDE.md) para instruções detalhadas sobre:
- Comandos de desenvolvimento
- Arquitetura e padrões
- Regras críticas
- Tarefas comuns
- Localizações de arquivos

## Contribuindo

Para contribuir com o projeto:
1. Siga o padrão Repository Pattern existente
2. Mantenha validações no Service layer
3. Use o formato de resposta padrão da API
4. Documente mudanças importantes
5. Teste antes de commitar

## Licença

Projeto desenvolvido para ASPROMOVIMAR - Associação de Proprietários e Moradores do Vila Maria Regina.

## Contato

Para mais informações sobre o projeto ou sobre a ASPROMOVIMAR, entre em contato através dos canais oficiais da associação.

---

**Desenvolvido para a comunidade do Vila Maria Regina** 🏘️
