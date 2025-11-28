const inscricaoRepository = require('../data/inscricaoRepository');
const contentRepository = require('../data/contentRepository');
const validators = require('../utils/validators');

class InscricaoService {
  async criarInscricao(dados) {
    // Validar evento
    if (!dados.evento_id) {
      throw new Error('ID do evento é obrigatório');
    }

    // Verificar se o evento existe
    const eventos = await contentRepository.getAllEventos();
    const evento = eventos.find(e => e.id === dados.evento_id);

    if (!evento) {
      throw new Error('Evento não encontrado');
    }

    if (!evento.ativo) {
      throw new Error('Este evento não está mais aceitando inscrições');
    }

    // Validar dados básicos
    if (!dados.nome_completo || dados.nome_completo.trim().length < 3) {
      throw new Error('Nome completo é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!dados.cpf || !validators.validarCPF(dados.cpf)) {
      throw new Error('CPF inválido');
    }

    if (!dados.telefone || !validators.validarTelefone(dados.telefone)) {
      throw new Error('Telefone inválido');
    }

    if (dados.email && !validators.validarEmail(dados.email)) {
      throw new Error('Email inválido');
    }

    // Limpar CPF (remover formatação)
    const cpfLimpo = dados.cpf.replace(/\D/g, '');

    // Verificar se já existe inscrição para este evento com este CPF
    const inscricaoExistente = await inscricaoRepository.findInscricaoByEventoAndCPF(
      dados.evento_id,
      cpfLimpo
    );

    if (inscricaoExistente) {
      throw new Error('Você já possui uma inscrição cadastrada para este evento');
    }

    const inscricaoData = {
      evento_id: dados.evento_id,
      evento_titulo: evento.titulo,
      nome_completo: dados.nome_completo.trim(),
      cpf: cpfLimpo,
      telefone: dados.telefone.trim(),
      email: dados.email ? dados.email.trim() : null,
      endereco: dados.endereco ? dados.endereco.trim() : null,
      numero_pessoas_residencia: dados.numero_pessoas_residencia || null,
      observacoes: dados.observacoes ? dados.observacoes.trim() : null,
      campos_personalizados: dados.campos_personalizados || {},
      status: 'pendente'
    };

    return await inscricaoRepository.createInscricao(inscricaoData);
  }

  async listarInscricoes(filtros = {}) {
    let inscricoes;

    if (filtros.evento_id && filtros.status) {
      inscricoes = await inscricaoRepository.getInscricoesByEventoAndStatus(
        filtros.evento_id,
        filtros.status
      );
    } else if (filtros.evento_id) {
      inscricoes = await inscricaoRepository.getInscricoesByEvento(filtros.evento_id);
    } else if (filtros.status) {
      inscricoes = await inscricaoRepository.getInscricoesByStatus(filtros.status);
    } else {
      inscricoes = await inscricaoRepository.getAllInscricoes();
    }

    return inscricoes;
  }

  async atualizarInscricao(id, dados) {
    const inscricoes = await inscricaoRepository.getAllInscricoes();
    const existe = inscricoes.find(i => i.id === id);

    if (!existe) {
      throw new Error('Inscrição não encontrada');
    }

    const dadosAtualizacao = {};

    if (dados.status !== undefined) {
      if (!['pendente', 'aprovado', 'reprovado'].includes(dados.status)) {
        throw new Error('Status inválido');
      }
      dadosAtualizacao.status = dados.status;
    }

    if (dados.observacoes !== undefined) {
      dadosAtualizacao.observacoes = dados.observacoes;
    }

    return await inscricaoRepository.updateInscricao(id, dadosAtualizacao);
  }

  async deletarInscricao(id) {
    return await inscricaoRepository.deleteInscricao(id);
  }

  async obterEstatisticas(eventoId = null) {
    if (eventoId) {
      return await inscricaoRepository.getEstatisticasPorEvento(eventoId);
    }
    return await inscricaoRepository.getEstatisticas();
  }

  async exportarCSV(eventoId = null) {
    let inscricoes;

    if (eventoId) {
      inscricoes = await inscricaoRepository.getInscricoesByEvento(eventoId);
    } else {
      inscricoes = await inscricaoRepository.getAllInscricoes();
    }

    const headers = [
      'ID',
      'Evento',
      'Nome Completo',
      'CPF',
      'Telefone',
      'Email',
      'Endereço',
      'Nº Pessoas',
      'Observações',
      'Status',
      'Data Inscrição'
    ];

    const rows = inscricoes.map(i => [
      i.id,
      i.evento_titulo,
      i.nome_completo,
      i.cpf,
      i.telefone,
      i.email || '',
      i.endereco || '',
      i.numero_pessoas_residencia,
      i.observacoes || '',
      i.status,
      new Date(i.data_inscricao).toLocaleString('pt-BR')
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    return csv;
  }
}

module.exports = new InscricaoService();
