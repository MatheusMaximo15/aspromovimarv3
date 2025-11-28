const beneficiarioService = require('../../services/beneficiarioService');

class BeneficiarioController {
  async criar(req, res) {
    try {
      const beneficiario = await beneficiarioService.criarBeneficiario(req.body);
      res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        data: beneficiario
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
      const filtros = {
        nome: req.query.nome,
        cpf: req.query.cpf,
        status_inscricao: req.query.status_inscricao,
        acao: req.query.acao
      };

      const beneficiarios = await beneficiarioService.listarBeneficiarios(filtros);

      res.status(200).json({
        success: true,
        data: beneficiarios,
        total: beneficiarios.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarPorCPF(req, res) {
    try {
      const beneficiario = await beneficiarioService.buscarPorCPF(req.params.cpf);

      if (!beneficiario) {
        return res.status(404).json({
          success: false,
          message: 'Beneficiário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: beneficiario
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
      const beneficiario = await beneficiarioService.atualizarBeneficiario(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Cadastro atualizado com sucesso!',
        data: beneficiario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async exportarCSV(req, res) {
    try {
      const filtros = {
        nome: req.query.nome,
        cpf: req.query.cpf,
        status_inscricao: req.query.status_inscricao,
        acao: req.query.acao
      };

      const beneficiarios = await beneficiarioService.listarBeneficiarios(filtros);
      const csv = await beneficiarioService.exportarCSV(beneficiarios);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=beneficiarios.csv');
      res.status(200).send('\uFEFF' + csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BeneficiarioController();
