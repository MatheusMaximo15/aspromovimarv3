const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas para listar conteúdo ativo
router.get('/noticias/:id', contentController.buscarNoticiaPorId);
router.get('/noticias', contentController.listarNoticias);
router.get('/eventos', contentController.listarEventos);

// Rotas protegidas para gerenciar notícias
router.post('/noticias', authMiddleware, contentController.criarNoticia);
router.put('/noticias/:id', authMiddleware, contentController.atualizarNoticia);
router.delete('/noticias/:id', authMiddleware, contentController.deletarNoticia);

// Rotas protegidas para gerenciar eventos
router.post('/eventos', authMiddleware, contentController.criarEvento);
router.put('/eventos/:id', authMiddleware, contentController.atualizarEvento);
router.delete('/eventos/:id', authMiddleware, contentController.deletarEvento);

module.exports = router;
