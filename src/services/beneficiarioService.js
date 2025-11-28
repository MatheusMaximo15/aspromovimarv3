const beneficiarioRepository = require('../data/beneficiarioRepository');
const { validarCPF, formatarCPF, validarTelefone } = require('../utils/validators');

class BeneficiarioService {
  async criarBeneficiario(dados) {
    if (!dados.nome_completo || dados.nome_completo.trim().length < 3) {
      throw new Error('Nome completo é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!dados.cpf || !validarCPF(dados.cpf)) {
      throw new Error('CPF inválido');
    }

    if (!dados.endereco || dados.endereco.trim().length < 5) {
      throw new Error('Endereço é obrigatório');
    }

    if (!dados.telefone || !validarTelefone(dados.telefone)) {
      throw new Error('Telefone inválido');
    }

    if (!dados.numero_pessoas_residencia || dados.numero_pessoas_residencia < 1) {
      throw new Error('Número de pessoas na residência deve ser no mínimo 1');
    }

    if (!dados.situacao_atual || dados.situacao_atual.trim().length < 10) {
      throw new Error('Situação atual é obrigatória e deve ter no mínimo 10 caracteres');
    }

    const cpfFormatado = dados.cpf.replace(/[^\d]/g, '');

    const beneficiarioData = {
      nome_completo: dados.nome_completo.trim(),
      cpf: cpfFormatado,
      endereco: dados.endereco.trim(),
      telefone: dados.telefone.replace(/[^\d]/g, ''),
      numero_pessoas_residencia: parseInt(dados.numero_pessoas_residencia),
      situacao_atual: dados.situacao_atual.trim(),
      comprovante_residencia_url: dados.comprovante_residencia_url || '',
      email: dados.email || null,
      acao: dados.acao || 'Mesa Brasil 2025'
    };

    return await beneficiarioRepository.createBeneficiario(beneficiarioData);
  }

  async listarBeneficiarios(filtros = {}) {
    let beneficiarios = await beneficiarioRepository.getAllBeneficiarios();

    if (filtros.nome) {
      const nomeFilter = filtros.nome.toLowerCase();
      beneficiarios = beneficiarios.filter(b =>
        b.nome_completo.toLowerCase().includes(nomeFilter)
      );
    }

    if (filtros.cpf) {
      const cpfFilter = filtros.cpf.replace(/[^\d]/g, '');
      beneficiarios = beneficiarios.filter(b => b.cpf.includes(cpfFilter));
    }

    if (filtros.status_inscricao) {
      beneficiarios = beneficiarios.filter(b =>
        b.status_inscricao === filtros.status_inscricao
      );
    }

    if (filtros.acao) {
      beneficiarios = beneficiarios.filter(b => b.acao === filtros.acao);
    }

    return beneficiarios;
  }

  async buscarPorCPF(cpf) {
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    return await beneficiarioRepository.findBeneficiarioByCPF(cpfLimpo);
  }

  async buscarPorId(id) {
    return await beneficiarioRepository.findBeneficiarioById(id);
  }

  async atualizarBeneficiario(id, dados) {
    const beneficiario = await beneficiarioRepository.findBeneficiarioById(id);

    if (!beneficiario) {
      throw new Error('Beneficiário não encontrado');
    }

    const dadosAtualizacao = {};

    if (dados.status_inscricao) {
      if (!['pendente', 'aprovado', 'reprovado'].includes(dados.status_inscricao)) {
        throw new Error('Status de inscrição inválido');
      }
      dadosAtualizacao.status_inscricao = dados.status_inscricao;
    }

    if (dados.nome_completo) {
      dadosAtualizacao.nome_completo = dados.nome_completo.trim();
    }

    if (dados.telefone) {
      if (!validarTelefone(dados.telefone)) {
        throw new Error('Telefone inválido');
      }
      dadosAtualizacao.telefone = dados.telefone.replace(/[^\d]/g, '');
    }

    if (dados.endereco) {
      dadosAtualizacao.endereco = dados.endereco.trim();
    }

    if (dados.numero_pessoas_residencia) {
      dadosAtualizacao.numero_pessoas_residencia = parseInt(dados.numero_pessoas_residencia);
    }

    if (dados.situacao_atual) {
      dadosAtualizacao.situacao_atual = dados.situacao_atual.trim();
    }

    if (dados.email !== undefined) {
      dadosAtualizacao.email = dados.email;
    }

    if (dados.comprovante_residencia_url !== undefined) {
      dadosAtualizacao.comprovante_residencia_url = dados.comprovante_residencia_url;
    }

    return await beneficiarioRepository.updateBeneficiario(id, dadosAtualizacao);
  }

  async exportarCSV(beneficiarios) {
    const headers = [
      'ID',
      'Nome Completo',
      'CPF',
      'Endereço',
      'Telefone',
      'Nº Pessoas',
      'Situação Atual',
      'Email',
      'Data Cadastro',
      'Status',
      'Ação'
    ];

    const rows = beneficiarios.map(b => [
      b.id,
      b.nome_completo,
      formatarCPF(b.cpf),
      b.endereco,
      b.telefone,
      b.numero_pessoas_residencia,
      b.situacao_atual,
      b.email || '',
      new Date(b.data_cadastro).toLocaleString('pt-BR'),
      b.status_inscricao,
      b.acao
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = new BeneficiarioService();
