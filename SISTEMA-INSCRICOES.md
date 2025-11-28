# Sistema de Inscrições por Evento - ASPROMOVIMAR

## Visão Geral

O sistema foi transformado de um cadastro específico para o Mesa Brasil em um **sistema genérico de inscrições vinculado a eventos**. Agora você pode criar qualquer tipo de evento e as pessoas podem se inscrever de forma organizada.

## Como Funciona

### 1. Criar um Evento

1. Acesse o painel administrativo: `http://localhost:3000/admin`
2. Faça login (admin / aspromovimar2025)
3. Vá para a aba **"Gerenciar Conteúdo"**
4. Clique na sub-aba **"Eventos"**
5. Clique em **"Novo Evento"**
6. Preencha:
   - Título (ex: "Ação Mesa Brasil 2025")
   - Descrição
   - Data do evento
   - Horário (opcional)
   - Local
   - Link (opcional)
   - **Marque como "ativo"** para aceitar inscrições
7. Salvar

### 2. Pessoas se Inscrevem

1. Visitantes acessam: `http://localhost:3000/cadastro`
2. Selecionam o evento desejado no dropdown
3. Preenchem o formulário:
   - Nome completo
   - CPF
   - Telefone
   - Email (opcional)
   - Endereço (opcional)
   - Número de pessoas na residência
   - Observações (opcional)
4. Enviam a inscrição

**Validações:**
- Mesma pessoa (CPF) **não pode** se inscrever duas vezes no **mesmo evento**
- Mesma pessoa **pode** se inscrever em **eventos diferentes**
- Evento deve estar **ativo** para aceitar inscrições

### 3. Gerenciar Inscrições (Admin)

1. Acesse o painel administrativo
2. Na aba **"Inscrições por Evento"** você pode:
   - **Filtrar por evento** - Ver inscrições de um evento específico ou todos
   - **Ver estatísticas** - Total, pendentes, aprovadas, reprovadas
   - **Aprovar/Reprovar** - Gerenciar status de cada inscrição
   - **Ver detalhes** - Visualizar todas as informações da inscrição
   - **Exportar CSV** - Baixar planilha filtrada por evento

## Estrutura de Dados

### Inscrição (inscricoes.json)
```json
{
  "id": "uuid",
  "evento_id": "id-do-evento",
  "evento_titulo": "Nome do Evento",
  "nome_completo": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "email": "joao@email.com",
  "endereco": "Rua X, 123",
  "numero_pessoas_residencia": 4,
  "observacoes": "Qualquer informação adicional",
  "status": "pendente|aprovado|reprovado",
  "data_inscricao": "2025-11-27T12:00:00.000Z"
}
```

## APIs Disponíveis

### Públicas
- `POST /api/inscricoes` - Criar inscrição
- `GET /api/eventos?proximos=true` - Listar eventos ativos

### Protegidas (Admin)
- `GET /api/inscricoes` - Listar todas inscrições
- `GET /api/inscricoes?evento_id=X` - Filtrar por evento
- `GET /api/inscricoes/estatisticas?evento_id=X` - Estatísticas
- `PUT /api/inscricoes/:id` - Atualizar status
- `DELETE /api/inscricoes/:id` - Deletar inscrição
- `GET /api/inscricoes/export/csv?evento_id=X` - Exportar CSV

## Exemplos de Uso

### Caso 1: Ação Social (Mesa Brasil)
1. Criar evento "Ação Mesa Brasil 2025"
2. Pessoas se inscrevem
3. Admin filtra inscrições deste evento
4. Aprova/reprova baseado em critérios
5. Exporta lista de aprovados

### Caso 2: Assembleia Geral
1. Criar evento "Assembleia Geral - Janeiro 2025"
2. Moradores se inscrevem para confirmar presença
3. Admin vê quantas pessoas confirmaram
4. Exporta lista para controle de presença

### Caso 3: Festa Junina
1. Criar evento "Festa Junina 2025"
2. Pessoas se inscrevem indicando número de acompanhantes
3. Admin vê total de participantes
4. Planeja quantidade de comida/bebida

## Sistema Legado

O sistema antigo do Mesa Brasil (beneficiários) ainda existe na aba **"Cadastros Mesa Brasil (legado)"** para não perder dados históricos. Mas **novos eventos devem usar o sistema de inscrições**.

## Vantagens

✅ Reutilizável para qualquer tipo de evento
✅ Organização por evento
✅ Previne duplicatas
✅ Estatísticas separadas
✅ Exportação filtrada
✅ Fácil de usar

## Arquivos Principais

- **Backend:**
  - `src/data/inscricaoRepository.js`
  - `src/services/inscricaoService.js`
  - `src/api/controllers/inscricaoController.js`
  - `src/api/routes/inscricaoRoutes.js`

- **Frontend:**
  - `public/cadastro.html`
  - `public/js/cadastro.js`
  - `public/admin.html` (aba Inscrições)
  - `public/js/admin.js`

- **Dados:**
  - `data/inscricoes.json` - Todas as inscrições
  - `data/eventos.json` - Eventos criados
