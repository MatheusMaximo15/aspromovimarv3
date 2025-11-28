const express = require('express');
const router = express.Router();
const beneficiarioController = require('../controllers/beneficiarioController');
const authMiddleware = require('../middleware/auth');

// Rotas específicas DEVEM vir ANTES de rotas com wildcards
router.get('/beneficiarios/export/csv', authMiddleware, beneficiarioController.exportarCSV);
router.get('/beneficiarios/cpf/:cpf', authMiddleware, beneficiarioController.buscarPorCPF);

// Rotas gerais
router.post('/beneficiarios', beneficiarioController.criar);
router.get('/beneficiarios', authMiddleware, beneficiarioController.listar);
router.put('/beneficiarios/:id', authMiddleware, beneficiarioController.atualizar);

module.exports = router;
