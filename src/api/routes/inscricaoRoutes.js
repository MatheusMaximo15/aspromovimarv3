const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const authMiddleware = require('../middleware/auth');

// Rota pública para criar inscrição
router.post('/inscricoes', inscricaoController.criar);

// Rotas específicas DEVEM vir ANTES de rotas com wildcards
router.get('/inscricoes/estatisticas', authMiddleware, inscricaoController.obterEstatisticas);
router.get('/inscricoes/export/csv', authMiddleware, inscricaoController.exportarCSV);

// Rotas gerais protegidas
router.get('/inscricoes', authMiddleware, inscricaoController.listar);
router.put('/inscricoes/:id', authMiddleware, inscricaoController.atualizar);
router.delete('/inscricoes/:id', authMiddleware, inscricaoController.deletar);

module.exports = router;
