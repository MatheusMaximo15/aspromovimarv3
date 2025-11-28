const contentService = require('../../services/contentService');

class ContentController {
  // NOTÍCIAS
  async criarNoticia(req, res) {
    try {
      const noticia = await contentService.criarNoticia(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: 'Notícia criada com sucesso',
        data: noticia
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async listarNoticias(req, res) {
    try {
      const apenasAtivas = req.query.ativas === 'true';
      const noticias = await contentService.listarNoticias(apenasAtivas);
      res.json({
        sucesso: true,
        data: noticias
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async atualizarNoticia(req, res) {
    try {
      const noticia = await contentService.atualizarNoticia(req.params.id, req.body);
      res.json({
        sucesso: true,
        mensagem: 'Notícia atualizada com sucesso',
        data: noticia
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async deletarNoticia(req, res) {
    try {
      await contentService.deletarNoticia(req.params.id);
      res.json({
        sucesso: true,
        mensagem: 'Notícia deletada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async buscarNoticiaPorId(req, res) {
    try {
      const noticia = await contentService.buscarNoticiaPorId(req.params.id);
      res.json({
        sucesso: true,
        data: noticia
      });
    } catch (error) {
      const status = error.message.includes('não encontrada') ? 404 : 500;
      res.status(status).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  // EVENTOS
  async criarEvento(req, res) {
    try {
      const evento = await contentService.criarEvento(req.body);
      res.status(201).json({
        sucesso: true,
        mensagem: 'Evento criado com sucesso',
        data: evento
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async listarEventos(req, res) {
    try {
      const apenasProximos = req.query.proximos === 'true';
      const eventos = await contentService.listarEventos(apenasProximos);
      res.json({
        sucesso: true,
        data: eventos
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async atualizarEvento(req, res) {
    try {
      const eventoAtualizado = await contentService.atualizarEvento(req.params.id, req.body);
      res.json({
        sucesso: true,
        mensagem: 'Evento atualizado com sucesso',
        data: eventoAtualizado
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async deletarEvento(req, res) {
    try {
      await contentService.deletarEvento(req.params.id);
      res.json({
        sucesso: true,
        mensagem: 'Evento deletado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }
}

module.exports = new ContentController();
