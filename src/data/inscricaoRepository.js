const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class InscricaoRepository {
  constructor() {
    this.inscricoesPath = path.join(__dirname, '../../data/inscricoes.json');
  }

  async _readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this._writeFile(filePath, []);
        return [];
      }
      throw error;
    }
  }

  async _writeFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAllInscricoes() {
    const inscricoes = await this._readFile(this.inscricoesPath);
    return inscricoes.sort((a, b) => new Date(b.data_inscricao) - new Date(a.data_inscricao));
  }

  async getInscricoesByEvento(eventoId) {
    const inscricoes = await this.getAllInscricoes();
    return inscricoes.filter(i => i.evento_id === eventoId);
  }

  async getInscricoesByStatus(status) {
    const inscricoes = await this.getAllInscricoes();
    return inscricoes.filter(i => i.status === status);
  }

  async getInscricoesByEventoAndStatus(eventoId, status) {
    const inscricoes = await this.getAllInscricoes();
    return inscricoes.filter(i => i.evento_id === eventoId && i.status === status);
  }

  async findInscricaoByCPF(cpf) {
    const inscricoes = await this._readFile(this.inscricoesPath);
    return inscricoes.find(i => i.cpf === cpf);
  }

  async findInscricaoByEventoAndCPF(eventoId, cpf) {
    const inscricoes = await this._readFile(this.inscricoesPath);
    return inscricoes.find(i => i.evento_id === eventoId && i.cpf === cpf);
  }

  async createInscricao(inscricaoData) {
    const inscricoes = await this._readFile(this.inscricoesPath);

    const novaInscricao = {
      id: uuidv4(),
      evento_id: inscricaoData.evento_id,
      evento_titulo: inscricaoData.evento_titulo,
      nome_completo: inscricaoData.nome_completo,
      cpf: inscricaoData.cpf,
      telefone: inscricaoData.telefone,
      email: inscricaoData.email || null,
      endereco: inscricaoData.endereco || null,
      numero_pessoas_residencia: inscricaoData.numero_pessoas_residencia || null,
      observacoes: inscricaoData.observacoes || null,
      campos_personalizados: inscricaoData.campos_personalizados || {},
      status: inscricaoData.status || 'pendente',
      data_inscricao: new Date().toISOString()
    };

    inscricoes.push(novaInscricao);
    await this._writeFile(this.inscricoesPath, inscricoes);
    return novaInscricao;
  }

  async updateInscricao(id, updateData) {
    const inscricoes = await this._readFile(this.inscricoesPath);
    const index = inscricoes.findIndex(i => i.id === id);

    if (index === -1) {
      throw new Error('Inscrição não encontrada');
    }

    inscricoes[index] = {
      ...inscricoes[index],
      ...updateData,
      id: inscricoes[index].id,
      data_inscricao: inscricoes[index].data_inscricao,
      data_atualizacao: new Date().toISOString()
    };

    await this._writeFile(this.inscricoesPath, inscricoes);
    return inscricoes[index];
  }

  async deleteInscricao(id) {
    const inscricoes = await this._readFile(this.inscricoesPath);
    const filtered = inscricoes.filter(i => i.id !== id);

    if (inscricoes.length === filtered.length) {
      throw new Error('Inscrição não encontrada');
    }

    await this._writeFile(this.inscricoesPath, filtered);
    return true;
  }

  async getEstatisticas() {
    const inscricoes = await this.getAllInscricoes();

    return {
      total: inscricoes.length,
      pendentes: inscricoes.filter(i => i.status === 'pendente').length,
      aprovadas: inscricoes.filter(i => i.status === 'aprovado').length,
      reprovadas: inscricoes.filter(i => i.status === 'reprovado').length
    };
  }

  async getEstatisticasPorEvento(eventoId) {
    const inscricoes = await this.getInscricoesByEvento(eventoId);

    return {
      total: inscricoes.length,
      pendentes: inscricoes.filter(i => i.status === 'pendente').length,
      aprovadas: inscricoes.filter(i => i.status === 'aprovado').length,
      reprovadas: inscricoes.filter(i => i.status === 'reprovado').length
    };
  }
}

module.exports = new InscricaoRepository();
