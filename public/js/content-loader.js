// Carrega notícias e eventos dinamicamente do servidor
document.addEventListener('DOMContentLoaded', async () => {
  await carregarNoticiasHome();
  await carregarEventosHome();
  await carregarAcoesSociaisHome();
});

async function carregarNoticiasHome() {
  try {
    const response = await fetch('/api/noticias?ativas=true');

    if (response.ok) {
      const result = await response.json();
      const noticias = result.data.slice(0, 3); // Mostrar apenas as 3 mais recentes

      const container = document.getElementById('noticias-container');

      if (!container) return;

      if (noticias.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhuma notícia disponível no momento.</p>';
        return;
      }

      container.innerHTML = noticias.map((noticia, index) => {
        const delay = (index + 1) * 100;

        // Remover HTML para obter apenas o texto puro
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = noticia.descricao;
        let textoPuro = tempDiv.textContent || tempDiv.innerText || '';

        // Truncar descrição em 150 caracteres
        let descricaoTruncada = textoPuro;
        if (descricaoTruncada.length > 150) {
          descricaoTruncada = descricaoTruncada.substring(0, 150) + '...';
        }

        return `
          <div class="project-card card-hover tilt-3d reveal delay-${delay}" style="cursor: pointer; display: flex; flex-direction: column; height: 100%;" onclick="window.location.href='/noticias/${noticia.id}'">
            <div class="spotlight"></div>
            <span class="badge">${noticia.categoria}</span>
            <h3>${noticia.titulo}</h3>
            <p style="flex-grow: 1;">${descricaoTruncada}</p>
            <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-light);">
              ${new Date(noticia.data).toLocaleDateString('pt-BR')}
            </div>
            <a href="/noticias/${noticia.id}" class="btn btn-primary" style="margin-top: auto;">Ler mais</a>
          </div>
        `;
      }).join('');

      // Reinicializar animações para novos elementos
      if (window.initScrollReveal) {
        window.initScrollReveal();
      }
      if (window.initTilt3D) {
        window.initTilt3D();
      }
      if (window.initSpotlightEffect) {
        window.initSpotlightEffect();
      }
    }
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
  }
}

async function carregarEventosHome() {
  try {
    const response = await fetch('/api/eventos?proximos=true');

    if (response.ok) {
      const result = await response.json();
      // Filtrar apenas eventos marcados para aparecer em "Próximos Eventos"
      const eventosFiltrados = result.data.filter(e => e.proximo_evento !== false);
      const eventos = eventosFiltrados.slice(0, 3); // Mostrar apenas os 3 próximos eventos

      const container = document.getElementById('eventos-container');

      if (!container) return;

      if (eventos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhum evento próximo no momento.</p>';
        return;
      }

      // Centralizar quando houver apenas 1 card
      if (eventos.length === 1) {
        container.classList.add('single-card');
      } else {
        container.classList.remove('single-card');
      }

      container.innerHTML = eventos.map((evento, index) => {
        const delay = (index + 1) * 100;
        const dataEvento = new Date(evento.data_evento);
        const descricaoFormatada = (evento.descricao || '').replace(/\n/g, '<br>');

        return `
          <div class="project-card card-hover tilt-3d reveal delay-${delay}">
            <div class="spotlight"></div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="background: var(--primary-color); color: white; padding: 0.75rem; border-radius: 8px; text-align: center; min-width: 60px;">
                <div style="font-size: 1.5rem; font-weight: 700;">${dataEvento.getDate()}</div>
                <div style="font-size: 0.75rem;">${dataEvento.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</div>
              </div>
              <div>
                <h3 style="margin: 0;">${evento.titulo}</h3>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-light);">
                  ${evento.horario ? evento.horario + ' - ' : ''}${evento.local}
                </p>
              </div>
            </div>
            <p>${descricaoFormatada}</p>
            ${evento.link ? `<a href="${evento.link}" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Mais informações</a>` : ''}
          </div>
        `;
      }).join('');

      // Reinicializar animações para novos elementos
      if (window.initScrollReveal) {
        window.initScrollReveal();
      }
      if (window.initTilt3D) {
        window.initTilt3D();
      }
      if (window.initSpotlightEffect) {
        window.initSpotlightEffect();
      }
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
}

async function carregarAcoesSociaisHome() {
  try {
    const response = await fetch('/api/eventos?proximos=true');

    if (response.ok) {
      const result = await response.json();

      // Obter data local do usuário (sem timezone issues)
      const hoje = new Date();
      const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

      // Filtrar ações sociais ativas e que ainda não expiraram
      const eventos = (result.data || []).filter(e => {
        if (!e.ativo || !e.acao_social) return false;

        // Se tem data de término, verificar se não passou
        if (e.data_evento_fim) {
          const [ano, mes, dia] = e.data_evento_fim.split('-').map(Number);
          const dataFim = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
          return dataFim >= hojeSemHora;
        }

        // Se não tem data de término, verificar se a data do evento ainda não passou
        const [ano, mes, dia] = e.data_evento.split('-').map(Number);
        const dataEvento = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
        return dataEvento >= hojeSemHora;
      });

      const container = document.getElementById('acoes-container');

      if (!container) return;

      if (eventos.length === 0) {
        container.innerHTML = `
          <div class="project-card hover-scale reveal" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <h3>Novas Ações em Breve</h3>
            <p>
              A ASPROMOVIMAR está sempre buscando parcerias e oportunidades para
              desenvolver novas ações sociais que beneficiem nossa comunidade.
            </p>
          </div>
        `;
        if (window.initScrollReveal) {
          window.initScrollReveal();
        }
        return;
      }

      // Centralizar quando houver apenas 1 card
      if (eventos.length === 1) {
        container.classList.add('single-card');
      } else {
        container.classList.remove('single-card');
      }

      container.innerHTML = eventos.map((evento, index) => {
        const delay = (index + 1) * 100;
        const dataEvento = new Date(evento.data_evento);

        let periodo;
        if (evento.data_evento_fim) {
          const dataFim = new Date(evento.data_evento_fim);
          if (dataEvento.getTime() === dataFim.getTime()) {
            // Mesmo dia
            periodo = dataEvento.toLocaleDateString('pt-BR');
          } else {
            // Período com início e fim
            periodo = `${dataEvento.toLocaleDateString('pt-BR')} até ${dataFim.toLocaleDateString('pt-BR')}`;
          }
        } else {
          // Evento sem data de término (um único dia)
          periodo = dataEvento.toLocaleDateString('pt-BR');
        }

        // Usar descrição alternativa se disponível, senão usar a descrição padrão
        const descricaoTexto = evento.descricao_acao_social || evento.descricao || '';
        const descricaoFormatada = descricaoTexto.replace(/\n/g, '<br>');

        return `
          <div class="project-card card-hover spotlight reveal delay-${delay}" style="border: 2px solid var(--secondary-color);">
            <span class="badge-pulse" style="background-color: var(--secondary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500;">ATIVA</span>
            <h3 style="margin-top: 1rem;">${evento.titulo}</h3>
            <p>${descricaoFormatada}</p>
            <p><strong>Período:</strong> ${periodo}</p>
            ${evento.mostrar_botao_inscricao ? `<a href="/cadastro" class="btn btn-shimmer">Inscreva-se</a>` : (evento.link ? `<a href="${evento.link}" target="_blank" class="btn btn-shimmer">Saiba mais</a>` : '')}
          </div>
        `;
      }).join('');

      if (window.initScrollReveal) {
        window.initScrollReveal();
      }
      if (window.initTilt3D) {
        window.initTilt3D();
      }
      if (window.initSpotlightEffect) {
        window.initSpotlightEffect();
      }
    }
  } catch (error) {
    console.error('Erro ao carregar ações sociais:', error);
  }
}
