const contentRepository = require('../data/contentRepository');
const sanitizeHtml = require('sanitize-html');

class ContentService {
  // NOTÍCIAS
  async criarNoticia(dados) {
    if (!dados.titulo || dados.titulo.trim().length < 3) {
      throw new Error('Título é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!dados.descricao || dados.descricao.trim().length < 10) {
      throw new Error('Descrição é obrigatória e deve ter no mínimo 10 caracteres');
    }

    const noticiaData = {
      titulo: dados.titulo.trim(),
      descricao: sanitizeHtml(dados.descricao.trim(), {
        allowedTags: [
          'p', 'br', 'strong', 'em', 'u', 'h2', 'h3',
          'ul', 'ol', 'li', 'a', 'img', 'blockquote'
        ],
        allowedAttributes: {
          a: ['href', 'target'],
          img: ['src', 'alt', 'width', 'height'],
        },
        allowedSchemes: ['http', 'https', 'data']
      }),
      data: dados.data || new Date().toISOString(),
      categoria: dados.categoria || 'Comunicado',
      link: dados.link || null,
      ativa: dados.ativa !== false
    };

    return await contentRepository.createNoticia(noticiaData);
  }

  async listarNoticias(apenasAtivas = false) {
    if (apenasAtivas) {
      return await contentRepository.getNoticiasAtivas();
    }
    return await contentRepository.getAllNoticias();
  }

  async atualizarNoticia(id, dados) {
    const noticia = await contentRepository.getAllNoticias();
    const existe = noticia.find(n => n.id === id);

    if (!existe) {
      throw new Error('Notícia não encontrada');
    }

    const dadosAtualizacao = {};

    if (dados.titulo) {
      dadosAtualizacao.titulo = dados.titulo.trim();
    }

    if (dados.descricao) {
      dadosAtualizacao.descricao = sanitizeHtml(dados.descricao.trim(), {
        allowedTags: [
          'p', 'br', 'strong', 'em', 'u', 'h2', 'h3',
          'ul', 'ol', 'li', 'a', 'img', 'blockquote'
        ],
        allowedAttributes: {
          a: ['href', 'target'],
          img: ['src', 'alt', 'width', 'height'],
        },
        allowedSchemes: ['http', 'https', 'data']
      });
    }

    if (dados.data) {
      dadosAtualizacao.data = dados.data;
    }

    if (dados.categoria) {
      dadosAtualizacao.categoria = dados.categoria;
    }

    if (dados.link !== undefined) {
      dadosAtualizacao.link = dados.link;
    }

    if (dados.ativa !== undefined) {
      dadosAtualizacao.ativa = dados.ativa;
    }

    return await contentRepository.updateNoticia(id, dadosAtualizacao);
  }

  async deletarNoticia(id) {
    return await contentRepository.deleteNoticia(id);
  }

  async buscarNoticiaPorId(id) {
    const noticia = await contentRepository.getNoticiaById(id);
    if (!noticia) {
      throw new Error('Notícia não encontrada');
    }
    return noticia;
  }

  // EVENTOS
  async criarEvento(dados) {
    if (!dados.titulo || dados.titulo.trim().length < 3) {
      throw new Error('Título é obrigatório e deve ter no mínimo 3 caracteres');
    }

    if (!dados.descricao || dados.descricao.trim().length < 10) {
      throw new Error('Descrição é obrigatória e deve ter no mínimo 10 caracteres');
    }

    if (!dados.data_evento) {
      throw new Error('Data do evento é obrigatória');
    }

    const eventoData = {
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      data_evento: dados.data_evento,
      horario: dados.horario || '',
      local: dados.local || 'A definir',
      link: dados.link || null,
      ativo: dados.ativo !== false,
      acao_social: dados.acao_social === true,
      mostrar_botao_inscricao: dados.mostrar_botao_inscricao === true
    };

    return await contentRepository.createEvento(eventoData);
  }

  async listarEventos(apenasProximos = false) {
    if (apenasProximos) {
      return await contentRepository.getEventosProximos();
    }
    return await contentRepository.getAllEventos();
  }

  async atualizarEvento(id, dados) {
    const eventos = await contentRepository.getAllEventos();
    const existe = eventos.find(e => e.id === id);

    if (!existe) {
      throw new Error('Evento não encontrado');
    }

    const dadosAtualizacao = {};

    if (dados.titulo) {
      dadosAtualizacao.titulo = dados.titulo.trim();
    }

    if (dados.descricao) {
      dadosAtualizacao.descricao = dados.descricao.trim();
    }

    if (dados.data_evento) {
      dadosAtualizacao.data_evento = dados.data_evento;
    }

    if (dados.horario !== undefined) {
      dadosAtualizacao.horario = dados.horario;
    }

    if (dados.local !== undefined) {
      dadosAtualizacao.local = dados.local;
    }

    if (dados.link !== undefined) {
      dadosAtualizacao.link = dados.link;
    }

    if (dados.descricao !== undefined) {
      dadosAtualizacao.descricao = dados.descricao.trim();
    }

    if (dados.descricao_acao_social !== undefined) {
      dadosAtualizacao.descricao_acao_social = dados.descricao_acao_social ? dados.descricao_acao_social.trim() : null;
    }

    if (dados.data_evento_fim !== undefined) {
      dadosAtualizacao.data_evento_fim = dados.data_evento_fim;
    }

    if (dados.ativo !== undefined) {
      dadosAtualizacao.ativo = dados.ativo;
    }

    if (dados.proximo_evento !== undefined) {
      dadosAtualizacao.proximo_evento = dados.proximo_evento;
    }

    if (dados.acao_social !== undefined) {
      dadosAtualizacao.acao_social = dados.acao_social;
    }

    if (dados.mostrar_botao_inscricao !== undefined) {
      dadosAtualizacao.mostrar_botao_inscricao = dados.mostrar_botao_inscricao;
    }

    return await contentRepository.updateEvento(id, dadosAtualizacao);
  }

  async deletarEvento(id) {
    return await contentRepository.deleteEvento(id);
  }
}

module.exports = new ContentService();
