const inscricaoService = require('../../services/inscricaoService');

class InscricaoController {
  async criar(req, res) {
    try {
      const inscricao = await inscricaoService.criarInscricao(req.body);
      res.status(201).json({
        success: true,
        message: 'Inscrição realizada com sucesso! Aguarde a análise.',
        data: inscricao
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const filtros = {};

      if (req.query.evento_id) {
        filtros.evento_id = req.query.evento_id;
      }

      if (req.query.status) {
        filtros.status = req.query.status;
      }

      const inscricoes = await inscricaoService.listarInscricoes(filtros);

      res.json({
        success: true,
        data: inscricoes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {
      const inscricao = await inscricaoService.atualizarInscricao(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Inscrição atualizada com sucesso',
        data: inscricao
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletar(req, res) {
    try {
      await inscricaoService.deletarInscricao(req.params.id);

      res.json({
        success: true,
        message: 'Inscrição deletada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticas(req, res) {
    try {
      const eventoId = req.query.evento_id || null;
      const stats = await inscricaoService.obterEstatisticas(eventoId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async exportarCSV(req, res) {
    try {
      const eventoId = req.query.evento_id || null;
      const csv = await inscricaoService.exportarCSV(eventoId);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=inscricoes_${Date.now()}.csv`);
      res.send('\uFEFF' + csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InscricaoController();
