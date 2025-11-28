// noticia-detail.js - Carrega e exibe detalhes de uma notícia específica

document.addEventListener('DOMContentLoaded', async () => {
  // Extrair ID da URL
  const path = window.location.pathname;
  const noticiaId = path.split('/').pop();

  if (!noticiaId) {
    mostrarErro('ID da notícia não encontrado');
    return;
  }

  try {
    // Buscar dados da notícia
    const response = await fetch(`/api/noticias/${noticiaId}`);
    const data = await response.json();

    if (!data.sucesso || !data.data) {
      mostrarErro(data.mensagem || 'Notícia não encontrada');
      return;
    }

    const noticia = data.data;

    // Verificar se a notícia está ativa
    if (!noticia.ativa) {
      mostrarErro('Esta notícia não está mais disponível', true);
      return;
    }

    // Renderizar notícia
    renderizarNoticia(noticia);

  } catch (error) {
    console.error('Erro ao carregar notícia:', error);
    mostrarErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
  }
});

function renderizarNoticia(noticia) {
  // Ocultar loading
  document.getElementById('loading-state').style.display = 'none';

  // Mostrar conteúdo
  document.getElementById('content-state').style.display = 'block';

  // Atualizar título da página
  document.title = `${noticia.titulo} | ASPROMOVIMAR`;

  // Atualizar meta tags
  atualizarMetaTags(noticia);

  // Atualizar breadcrumb
  document.getElementById('breadcrumb-title').textContent = noticia.titulo;

  // Atualizar categoria (header e sidebar)
  const categoriaEl = document.getElementById('noticia-categoria');
  categoriaEl.textContent = noticia.categoria || 'Comunicado';
  categoriaEl.className = `noticia-categoria-badge categoria-${(noticia.categoria || 'comunicado').toLowerCase().replace(/\s+/g, '-')}`;

  const sidebarCategoriaEl = document.getElementById('sidebar-categoria');
  if (sidebarCategoriaEl) {
    sidebarCategoriaEl.textContent = noticia.categoria || 'Comunicado';
  }

  // Atualizar data (header e sidebar)
  const dataEl = document.getElementById('noticia-data');
  const dataFormatada = formatarData(noticia.data);
  dataEl.textContent = dataFormatada;
  dataEl.setAttribute('datetime', noticia.data);

  const sidebarDataEl = document.getElementById('sidebar-data');
  if (sidebarDataEl) {
    sidebarDataEl.textContent = dataFormatada;
  }

  // Atualizar título
  document.getElementById('noticia-titulo').textContent = noticia.titulo;

  // Renderizar HTML rico
  const contentEl = document.getElementById('noticia-content');
  contentEl.innerHTML = noticia.descricao;

  // Aplicar estilos ricos ao conteúdo
  aplicarEstilosRicos(contentEl);

  // Inicializar animações
  if (typeof initAnimations === 'function') {
    initAnimations();
  }
}

function aplicarEstilosRicos(container) {
  // Aplicar drop cap ao primeiro parágrafo
  const primeiroParagrafo = container.querySelector('p');
  if (primeiroParagrafo && primeiroParagrafo.textContent.trim().length > 0) {
    primeiroParagrafo.classList.add('drop-cap');
  }

  // Tornar imagens responsivas
  container.querySelectorAll('img').forEach(img => {
    img.classList.add('noticia-img-responsive');
    img.setAttribute('loading', 'lazy');
  });

  // Estilizar blockquotes
  container.querySelectorAll('blockquote').forEach(quote => {
    quote.classList.add('noticia-quote-styled');
  });

  // Estilizar links
  container.querySelectorAll('a').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}

function atualizarMetaTags(noticia) {
  // Extrair texto puro da descrição HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = noticia.descricao;
  const textoPlano = tempDiv.textContent || tempDiv.innerText || '';
  const metaDescription = textoPlano.substring(0, 160);

  // Meta description
  let descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute('content', metaDescription);
  }

  // Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', noticia.titulo);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', metaDescription);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', window.location.href);

  // Article published time
  const existingTime = document.querySelector('meta[property="article:published_time"]');
  if (existingTime) {
    existingTime.setAttribute('content', noticia.data);
  } else {
    const timeTag = document.createElement('meta');
    timeTag.setAttribute('property', 'article:published_time');
    timeTag.setAttribute('content', noticia.data);
    document.head.appendChild(timeTag);
  }
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  const opcoes = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };
  return data.toLocaleDateString('pt-BR', opcoes);
}

function mostrarErro(mensagem, noticiaInativa = false) {
  // Ocultar loading
  document.getElementById('loading-state').style.display = 'none';

  // Mostrar erro
  const errorState = document.getElementById('error-state');
  errorState.style.display = 'block';

  // Atualizar mensagem
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = mensagem;

  // Atualizar título
  if (noticiaInativa) {
    document.querySelector('#error-state h2').textContent = 'Notícia Indisponível';
  }

  // Atualizar título da página
  document.title = 'Notícia não encontrada | ASPROMOVIMAR';
}

// Funções de compartilhamento social
window.compartilharFacebook = function () {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
};

window.compartilharWhatsApp = function () {
  const url = encodeURIComponent(window.location.href);
  const titulo = encodeURIComponent(document.title);
  window.open(`https://wa.me/?text=${titulo}%20${url}`, '_blank');
};

window.compartilharTwitter = function () {
  const url = encodeURIComponent(window.location.href);
  const titulo = encodeURIComponent(document.querySelector('#noticia-titulo')?.textContent || document.title);
  window.open(`https://twitter.com/intent/tweet?text=${titulo}&url=${url}`, '_blank', 'width=600,height=400');
};
