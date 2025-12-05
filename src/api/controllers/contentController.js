const contentService = require('../../services/contentService');

class ContentController {
  // NOTÍCIAS
  async criarNoticia(req, res) {
    try {
      const noticia = await contentService.criarNoticia(req.body);
      res.status(201).json({
        success: true,
        message: 'Notícia criada com sucesso',
        data: noticia
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarNoticias(req, res) {
    try {
      const apenasAtivas = req.query.ativas === 'true';
      const noticias = await contentService.listarNoticias(apenasAtivas);
      res.json({
        success: true,
        data: noticias
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async atualizarNoticia(req, res) {
    try {
      const noticia = await contentService.atualizarNoticia(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Notícia atualizada com sucesso',
        data: noticia
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletarNoticia(req, res) {
    try {
      await contentService.deletarNoticia(req.params.id);
      res.json({
        success: true,
        message: 'Notícia deletada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarNoticiaPorId(req, res) {
    try {
      const noticia = await contentService.buscarNoticiaPorId(req.params.id);
      res.json({
        success: true,
        data: noticia
      });
    } catch (error) {
      const status = error.message.includes('não encontrada') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // EVENTOS
  async criarEvento(req, res) {
    console.log('→ contentController.criarEvento chamado', {
      body: req.body,
      headers: req.headers.authorization ? 'Present' : 'Missing'
    });
    try {
      const evento = await contentService.criarEvento(req.body);
      res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        data: evento
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarEventos(req, res) {
    try {
      const apenasProximos = req.query.proximos === 'true';
      const eventos = await contentService.listarEventos(apenasProximos);
      res.json({
        success: true,
        data: eventos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async atualizarEvento(req, res) {
    console.log('→ contentController.atualizarEvento chamado', {
      id: req.params.id,
      body: req.body
    });
    try {
      const eventoAtualizado = await contentService.atualizarEvento(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Evento atualizado com sucesso',
        data: eventoAtualizado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletarEvento(req, res) {
    console.log('→ contentController.deletarEvento chamado', {
      id: req.params.id
    });
    try {
      await contentService.deletarEvento(req.params.id);
      res.json({
        success: true,
        message: 'Evento deletado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ContentController();
