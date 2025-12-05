const { v4: uuidv4 } = require('uuid');
const BlobRepository = require('./blobRepository');

class ContentRepository extends BlobRepository {
  constructor() {
    super();
    this.NOTICIAS_BLOB = 'noticias.json';
    this.EVENTOS_BLOB = 'eventos.json';
  }

  // NOTÍCIAS
  async getAllNoticias() {
    const noticias = await this._readBlob(this.NOTICIAS_BLOB);
    return noticias.sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  async getNoticiasAtivas(limit = null) {
    const noticias = await this.getAllNoticias();
    const ativas = noticias.filter(n => n.ativa);
    return limit ? ativas.slice(0, limit) : ativas;
  }

  async getNoticiaById(id) {
    const noticias = await this._readBlob(this.NOTICIAS_BLOB);
    return noticias.find(n => n.id === id);
  }

  async createNoticia(noticiaData) {
    const noticias = await this._readBlob(this.NOTICIAS_BLOB);

    const novaNoticia = {
      id: uuidv4(),
      titulo: noticiaData.titulo,
      descricao: noticiaData.descricao,
      data: noticiaData.data || new Date().toISOString(),
      categoria: noticiaData.categoria || 'Comunicado',
      link: noticiaData.link || null,
      ativa: noticiaData.ativa !== false,
      data_criacao: new Date().toISOString()
    };

    noticias.push(novaNoticia);
    await this._writeBlob(this.NOTICIAS_BLOB, noticias);
    return novaNoticia;
  }

  async updateNoticia(id, updateData) {
    const noticias = await this._readBlob(this.NOTICIAS_BLOB);
    const index = noticias.findIndex(n => n.id === id);

    if (index === -1) {
      throw new Error('Notícia não encontrada');
    }

    noticias[index] = {
      ...noticias[index],
      ...updateData,
      id: noticias[index].id,
      data_criacao: noticias[index].data_criacao,
      data_atualizacao: new Date().toISOString()
    };

    await this._writeBlob(this.NOTICIAS_BLOB, noticias);
    return noticias[index];
  }

  async deleteNoticia(id) {
    const noticias = await this._readBlob(this.NOTICIAS_BLOB);
    const filtered = noticias.filter(n => n.id !== id);

    if (noticias.length === filtered.length) {
      throw new Error('Notícia não encontrada');
    }

    await this._writeBlob(this.NOTICIAS_BLOB, filtered);
    return true;
  }

  // EVENTOS
  async getAllEventos() {
    const eventos = await this._readBlob(this.EVENTOS_BLOB);
    return eventos.sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));
  }

  async getEventosProximos(limit = null) {
    const eventos = await this.getAllEventos();

    // Obter data atual em UTC-3 (horário de Brasília)
    const agora = new Date();
    const offsetBrasilia = -3 * 60; // UTC-3 em minutos
    const hoje = new Date(agora.getTime() + (agora.getTimezoneOffset() + offsetBrasilia) * 60000);
    hoje.setHours(0, 0, 0, 0);

    const proximos = eventos.filter(e => {
      if (!e.ativo) return false;

      // Parse da data do evento (vem como string YYYY-MM-DD)
      const [ano, mes, dia] = e.data_evento.split('-').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia);

      return dataEvento >= hoje;
    });
    return limit ? proximos.slice(0, limit) : proximos;
  }

  async createEvento(eventoData) {
    const eventos = await this._readBlob(this.EVENTOS_BLOB);

    const novoEvento = {
      id: uuidv4(),
      titulo: eventoData.titulo,
      descricao: eventoData.descricao,
      descricao_acao_social: eventoData.descricao_acao_social || null,
      data_evento: eventoData.data_evento,
      data_evento_fim: eventoData.data_evento_fim || null,
      horario: eventoData.horario || '',
      local: eventoData.local || 'A definir',
      link: eventoData.link || null,
      ativo: eventoData.ativo !== false,
      proximo_evento: eventoData.proximo_evento !== false,
      acao_social: eventoData.acao_social === true,
      mostrar_botao_inscricao: eventoData.mostrar_botao_inscricao === true,
      data_criacao: new Date().toISOString()
    };

    eventos.push(novoEvento);
    await this._writeBlob(this.EVENTOS_BLOB, eventos);
    return novoEvento;
  }

  async updateEvento(id, updateData) {
    const eventos = await this._readBlob(this.EVENTOS_BLOB);
    const index = eventos.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error('Evento não encontrado');
    }

    eventos[index] = {
      ...eventos[index],
      ...updateData,
      id: eventos[index].id,
      data_criacao: eventos[index].data_criacao,
      data_atualizacao: new Date().toISOString()
    };

    await this._writeBlob(this.EVENTOS_BLOB, eventos);
    return eventos[index];
  }

  async deleteEvento(id) {
    const eventos = await this._readBlob(this.EVENTOS_BLOB);
    const filtered = eventos.filter(e => e.id !== id);

    if (eventos.length === filtered.length) {
      throw new Error('Evento não encontrado');
    }

    await this._writeBlob(this.EVENTOS_BLOB, filtered);
    return true;
  }
}

module.exports = new ContentRepository();
