let authToken = null;
let todosBeneficiarios = [];

// Toast Notification System
function showToast(message, type = 'success', title = null) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'i'
  };

  const titles = {
    success: title || 'Sucesso!',
    error: title || 'Erro',
    info: title || 'Informação'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto remove após 5 segundos
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Confirmation Modal System
function showConfirm(message, title = 'Confirmar ação', confirmText = 'Confirmar', cancelText = 'Cancelar') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';

    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-modal-header">
          <h3 class="confirm-modal-title">${title}</h3>
        </div>
        <div class="confirm-modal-body">
          ${message}
        </div>
        <div class="confirm-modal-footer">
          <button class="btn btn-small" id="confirm-cancel">${cancelText}</button>
          <button class="btn btn-primary" id="confirm-ok">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const confirmBtn = overlay.querySelector('#confirm-ok');
    const cancelBtn = overlay.querySelector('#confirm-cancel');

    const removeModal = () => {
      overlay.style.animation = 'fadeOut 0.2s ease-in';
      setTimeout(() => overlay.remove(), 200);
    };

    confirmBtn.addEventListener('click', () => {
      removeModal();
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      removeModal();
      resolve(false);
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        removeModal();
        resolve(false);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const adminSection = document.getElementById('admin-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const manualForm = document.getElementById('manual-cadastro-form');
  const manualErrorMessage = document.getElementById('manual-error-message');
  const manualSuccessMessage = document.getElementById('manual-success-message');
  const manualEventoSelect = document.getElementById('manual_evento_id');
  const manualCpfInput = document.getElementById('manual_cpf');
  const manualTelefoneInput = document.getElementById('manual_telefone');

  const filterNome = document.getElementById('filter-nome');
  const filterCPF = document.getElementById('filter-cpf');
  const filterStatus = document.getElementById('filter-status');
  const exportCSVBtn = document.getElementById('export-csv-btn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentials = btoa(`${username}:${password}`);
    authToken = `Basic ${credentials}`;

    try {
      const response = await fetch('/api/beneficiarios', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        loginError.style.display = 'none';
        await carregarBeneficiarios();
        await carregarEventosFiltro();
        await carregarInscricoes();
        await carregarEventosManuais();
      } else {
        loginError.textContent = 'Usuário ou senha inválidos';
        loginError.style.display = 'block';
        authToken = null;
      }
    } catch (error) {
      console.error('Erro:', error);
      loginError.textContent = 'Erro ao conectar com o servidor';
      loginError.style.display = 'block';
      authToken = null;
    }
  });

  // FORMATAÇÃO CPF/TELEFONE E CADASTRO MANUAL
  if (manualCpfInput) {
    manualCpfInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      }

      e.target.value = value;
    });
  }

  if (manualTelefoneInput) {
    manualTelefoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{1,4})/, '($1) $2');
      }

      e.target.value = value;
    });
  }

  async function carregarEventosManuais() {
    if (!manualEventoSelect) return;

    try {
      const response = await fetch('/api/eventos?proximos=true', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        const eventos = (result.data || []).filter(e => e.ativo);

        if (eventos.length === 0) {
          manualEventoSelect.innerHTML = '<option value="">Nenhum evento disponível no momento</option>';
          return;
        }

        manualEventoSelect.innerHTML = '<option value="">Selecione um evento</option>';
        eventos.forEach(evento => {
          const option = document.createElement('option');
          option.value = evento.id;
          const dataEvento = new Date(evento.data_evento).toLocaleDateString('pt-BR');
          option.textContent = `${evento.titulo} - ${dataEvento}`;
          manualEventoSelect.appendChild(option);
        });
      } else {
        manualEventoSelect.innerHTML = '<option value="">Erro ao carregar eventos</option>';
      }
    } catch (error) {
      console.error('Erro ao carregar eventos manuais:', error);
      manualEventoSelect.innerHTML = '<option value="">Erro ao carregar eventos</option>';
    }
  }

  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (manualErrorMessage) manualErrorMessage.style.display = 'none';
      if (manualSuccessMessage) manualSuccessMessage.style.display = 'none';

      const formData = new FormData(manualForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.evento_id) {
        mostrarErroManual('Por favor, selecione um evento.');
        return;
      }

      if (!validarCPFAdmin(data.cpf)) {
        mostrarErroManual('CPF inválido. Por favor, verifique o número digitado.');
        return;
      }

      const cpfLimpo = data.cpf.replace(/\D/g, '');
      const telefoneLimpo = data.telefone.replace(/\D/g, '');

      const inscricaoData = {
        evento_id: data.evento_id,
        nome_completo: data.nome_completo,
        cpf: cpfLimpo,
        endereco: data.endereco,
        telefone: telefoneLimpo,
        numero_pessoas_residencia: parseInt(data.numero_pessoas_residencia) || 1,
        email: data.email || null,
        observacoes: data.observacoes || null
      };

      const submitButton = manualForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Salvando...';

      try {
        const response = await fetch('/api/inscricoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify(inscricaoData)
        });

        const result = await response.json();

        if (response.ok) {
          mostrarSucessoManual('Inscrição manual salva com sucesso!');
          manualForm.reset();
          await carregarEventosManuais();
          await carregarInscricoes();
        } else {
          mostrarErroManual(result.mensagem || 'Erro ao salvar inscrição manual.');
        }
      } catch (error) {
        console.error('Erro ao salvar inscrição manual:', error);
        mostrarErroManual('Erro ao conectar com o servidor. Tente novamente.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Cadastro Manual';
      }
    });
  }

  logoutBtn.addEventListener('click', () => {
    authToken = null;
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
    loginForm.reset();
  });

  if (filterNome) filterNome.addEventListener('input', filtrarBeneficiarios);
  if (filterCPF) filterCPF.addEventListener('input', filtrarBeneficiarios);
  if (filterStatus) filterStatus.addEventListener('change', filtrarBeneficiarios);

  if (exportCSVBtn) exportCSVBtn.addEventListener('click', async () => {
    try {
      const params = new URLSearchParams();
      if (filterNome.value) params.append('nome', filterNome.value);
      if (filterCPF.value) params.append('cpf', filterCPF.value);
      if (filterStatus.value) params.append('status_inscricao', filterStatus.value);

      const response = await fetch(`/api/beneficiarios/export/csv?${params.toString()}`, {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beneficiarios-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao exportar CSV');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar CSV');
    }
  });

  async function carregarBeneficiarios() {
    try {
      const response = await fetch('/api/beneficiarios', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        todosBeneficiarios = result.data || [];
        filtrarBeneficiarios();
        atualizarEstatisticas();
      } else {
        console.error('Erro ao carregar beneficiários');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function filtrarBeneficiarios() {
    // Se os filtros não existem (ex.: aba antiga removida), apenas renderiza todos
    if (!filterNome || !filterCPF || !filterStatus) {
      renderizarTabela(todosBeneficiarios);
      return;
    }

    let beneficiariosFiltrados = [...todosBeneficiarios];

    const nomeFilter = filterNome.value.toLowerCase();
    if (nomeFilter) {
      beneficiariosFiltrados = beneficiariosFiltrados.filter(b =>
        b.nome_completo.toLowerCase().includes(nomeFilter)
      );
    }

    const cpfFilter = filterCPF.value.replace(/\D/g, '');
    if (cpfFilter) {
      beneficiariosFiltrados = beneficiariosFiltrados.filter(b =>
        b.cpf.includes(cpfFilter)
      );
    }

    const statusFilter = filterStatus.value;
    if (statusFilter) {
      beneficiariosFiltrados = beneficiariosFiltrados.filter(b =>
        b.status_inscricao === statusFilter
      );
    }

    renderizarTabela(beneficiariosFiltrados);
  }

  function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  function formatarTelefone(telefone) {
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  function validarCPFAdmin(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    if (digito2 !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  function mostrarErroManual(mensagem) {
    if (!manualErrorMessage) return;
    manualErrorMessage.textContent = mensagem;
    manualErrorMessage.style.display = 'block';
    if (manualSuccessMessage) manualSuccessMessage.style.display = 'none';
  }

  function mostrarSucessoManual(mensagem) {
    if (!manualSuccessMessage) return;
    manualSuccessMessage.textContent = mensagem;
    manualSuccessMessage.style.display = 'block';
    if (manualErrorMessage) manualErrorMessage.style.display = 'none';
  }

  function renderizarTabela(beneficiarios) {
    const tbody = document.getElementById('beneficiarios-table');

    // Se a tabela não existe mais (aba legada removida), não faz nada
    if (!tbody) return;

    if (beneficiarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-light);">
            Nenhum cadastro encontrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = beneficiarios.map(b => `
      <tr>
        <td>${b.nome_completo}</td>
        <td>${formatarCPF(b.cpf)}</td>
        <td>${formatarTelefone(b.telefone)}</td>
        <td>${b.numero_pessoas_residencia}</td>
        <td>
          <span class="status-badge status-${b.status_inscricao}">
            ${b.status_inscricao.charAt(0).toUpperCase() + b.status_inscricao.slice(1)}
          </span>
        </td>
        <td class="actions">
          ${b.status_inscricao === 'pendente' ? `
            <button class="btn btn-small" style="background-color: var(--success-color);" onclick="atualizarStatus('${b.id}', 'aprovado')">
              Aprovar
            </button>
            <button class="btn btn-small" style="background-color: var(--error-color);" onclick="atualizarStatus('${b.id}', 'reprovado')">
              Reprovar
            </button>
          ` : ''}
          <button class="btn btn-small btn-primary" onclick="verDetalhes('${b.id}')">
            Ver Detalhes
          </button>
        </td>
      </tr>
    `).join('');
  }

  function atualizarEstatisticas() {
    const total = todosBeneficiarios.length;
    const pendentes = todosBeneficiarios.filter(b => b.status_inscricao === 'pendente').length;
    const aprovados = todosBeneficiarios.filter(b => b.status_inscricao === 'aprovado').length;
    const reprovados = todosBeneficiarios.filter(b => b.status_inscricao === 'reprovado').length;

    const statTotal = document.getElementById('stat-total');
    const statPendente = document.getElementById('stat-pendente');
    const statAprovado = document.getElementById('stat-aprovado');
    const statReprovado = document.getElementById('stat-reprovado');

    // Se as caixas de estatística não existirem (layout alterado), apenas sai
    if (!statTotal || !statPendente || !statAprovado || !statReprovado) return;

    statTotal.textContent = total;
    statPendente.textContent = pendentes;
    statAprovado.textContent = aprovados;
    statReprovado.textContent = reprovados;
  }

  window.atualizarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`/api/beneficiarios/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status_inscricao: novoStatus })
      });

      if (response.ok) {
        await carregarBeneficiarios();
        alert(`Status atualizado para ${novoStatus} com sucesso!`);
      } else {
        const result = await response.json();
        alert(result.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar status');
    }
  };

  window.verDetalhes = (id) => {
    const beneficiario = todosBeneficiarios.find(b => b.id === id);
    if (!beneficiario) return;

    const detalhes = `
Nome: ${beneficiario.nome_completo}
CPF: ${formatarCPF(beneficiario.cpf)}
Endereço: ${beneficiario.endereco}
Telefone: ${formatarTelefone(beneficiario.telefone)}
Nº Pessoas: ${beneficiario.numero_pessoas_residencia}
Email: ${beneficiario.email || 'Não informado'}
Situação Atual: ${beneficiario.situacao_atual}
Comprovante: ${beneficiario.comprovante_residencia_url || 'Não informado'}
Data Cadastro: ${new Date(beneficiario.data_cadastro).toLocaleString('pt-BR')}
Status: ${beneficiario.status_inscricao}
Ação: ${beneficiario.acao}
    `.trim();

    alert(detalhes);
  };

  // TAB NAVIGATION
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');

      if (tabName === 'conteudo') {
        carregarNoticias();
        carregarEventos();
      }
    });
  });

  // SUBTAB NAVIGATION
  const subtabBtns = document.querySelectorAll('.subtab-btn');
  const subtabContents = document.querySelectorAll('.subtab-content');

  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtabName = btn.dataset.subtab;

      subtabBtns.forEach(b => b.classList.remove('active'));
      subtabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`subtab-${subtabName}`).classList.add('active');
    });
  });

  // GERENCIAMENTO DE NOTÍCIAS
  let todasNoticias = [];
  let noticiaEditando = null;
  let quillEditor = null;

  const btnNovaNoticia = document.getElementById('btn-nova-noticia');
  const formNoticia = document.getElementById('form-noticia');
  const noticiaForm = document.getElementById('noticia-form');
  const btnCancelarNoticia = document.getElementById('btn-cancelar-noticia');

  // Inicializar Quill Editor
  function inicializarQuillEditor() {
    if (quillEditor) return; // Já inicializado
    
    quillEditor = new Quill('#noticia-descricao-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image', 'blockquote'],
          ['clean']
        ]
      },
      placeholder: 'Digite o conteúdo da notícia...'
    });
  }

  btnNovaNoticia.addEventListener('click', () => {
    noticiaEditando = null;
    noticiaForm.reset();
    
    // Inicializar Quill se ainda não foi
    if (!quillEditor) {
      inicializarQuillEditor();
    }
    
    // Limpar conteúdo do editor
    quillEditor.root.innerHTML = '';
    
    document.getElementById('form-noticia-titulo').textContent = 'Nova Notícia';
    formNoticia.style.display = 'block';
  });

  btnCancelarNoticia.addEventListener('click', () => {
    formNoticia.style.display = 'none';
    noticiaForm.reset();
    if (quillEditor) {
      quillEditor.root.innerHTML = '';
    }
    noticiaEditando = null;
  });

  noticiaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturar HTML do Quill editor
    const descricaoHtml = quillEditor ? quillEditor.root.innerHTML : '';
    document.getElementById('noticia-descricao').value = descricaoHtml;

    const dados = {
      titulo: document.getElementById('noticia-titulo').value,
      descricao: descricaoHtml,
      categoria: document.getElementById('noticia-categoria').value,
      link: document.getElementById('noticia-link').value || null,
      ativa: document.getElementById('noticia-ativa').checked
    };

    try {
      let response;
      if (noticiaEditando) {
        response = await fetch(`/api/noticias/${noticiaEditando.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify(dados)
        });
      } else {
        response = await fetch('/api/noticias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify(dados)
        });
      }

      if (response.ok) {
        showToast(
          noticiaEditando ? 'A notícia foi atualizada e já está visível no site.' : 'A notícia foi criada e já está disponível no site.',
          'success',
          noticiaEditando ? 'Notícia Atualizada' : 'Notícia Criada'
        );
        formNoticia.style.display = 'none';
        noticiaForm.reset();
        noticiaEditando = null;
        await carregarNoticias();
      } else {
        const error = await response.json();
        showToast(error.message || 'Não foi possível salvar a notícia', 'error', 'Erro');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Ocorreu um erro ao salvar a notícia', 'error', 'Erro');
    }
  });

  async function carregarNoticias() {
    try {
      const response = await fetch('/api/noticias', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        todasNoticias = result.data;
        renderizarNoticias();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function renderizarNoticias() {
    const tbody = document.getElementById('noticias-table');

    if (todasNoticias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhuma notícia cadastrada</td></tr>';
      return;
    }

    tbody.innerHTML = todasNoticias.map(noticia => `
      <tr>
        <td>${noticia.titulo}</td>
        <td>${noticia.categoria}</td>
        <td>${new Date(noticia.data).toLocaleDateString('pt-BR')}</td>
        <td>
          <span class="status-badge status-${noticia.ativa ? 'aprovado' : 'reprovado'}">
            ${noticia.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </td>
        <td>
          <button class="btn btn-small" onclick="editarNoticia('${noticia.id}')">Editar</button>
          <button class="btn btn-small" onclick="toggleNoticiaStatus('${noticia.id}', ${!noticia.ativa})">
            ${noticia.ativa ? 'Desativar' : 'Ativar'}
          </button>
          <button class="btn btn-small" onclick="deletarNoticia('${noticia.id}')">Excluir</button>
        </td>
      </tr>
    `).join('');
  }

  window.editarNoticia = (id) => {
    noticiaEditando = todasNoticias.find(n => n.id === id);
    if (noticiaEditando) {
      // Inicializar Quill se ainda não foi
      if (!quillEditor) {
        inicializarQuillEditor();
      }
      
      document.getElementById('form-noticia-titulo').textContent = 'Editar Notícia';
      document.getElementById('noticia-titulo').value = noticiaEditando.titulo;
      
      // Preencher o editor Quill com HTML
      quillEditor.root.innerHTML = noticiaEditando.descricao;
      
      document.getElementById('noticia-categoria').value = noticiaEditando.categoria;
      document.getElementById('noticia-link').value = noticiaEditando.link || '';
      document.getElementById('noticia-ativa').checked = noticiaEditando.ativa;
      formNoticia.style.display = 'block';
    }
  };

  window.toggleNoticiaStatus = async (id, ativo) => {
    try {
      const response = await fetch(`/api/noticias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({ ativa: ativo })
      });

      if (response.ok) {
        await carregarNoticias();
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar status');
    }
  };

  window.deletarNoticia = async (id) => {
    const confirmado = await showConfirm(
      'Esta ação não pode ser desfeita. A notícia será permanentemente removida do sistema.',
      'Tem certeza que deseja excluir esta notícia?',
      'Excluir',
      'Cancelar'
    );

    if (!confirmado) {
      return;
    }

    try {
      const response = await fetch(`/api/noticias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        showToast('A notícia foi excluída com sucesso', 'success', 'Notícia Excluída');
        await carregarNoticias();
      } else {
        showToast('Não foi possível excluir a notícia', 'error', 'Erro');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Ocorreu um erro ao excluir a notícia', 'error', 'Erro');
    }
  };

  // GERENCIAMENTO DE EVENTOS
  let todosEventos = [];
  let eventoEditando = null;

  const btnNovoEvento = document.getElementById('btn-novo-evento');
  const formEvento = document.getElementById('form-evento');
  const eventoForm = document.getElementById('evento-form');
  const btnCancelarEvento = document.getElementById('btn-cancelar-evento');

  btnNovoEvento.addEventListener('click', () => {
    eventoEditando = null;
    eventoForm.reset();

    // Garantir que os checkboxes voltem ao estado padrão
    document.getElementById('evento-ativo').checked = true;
    document.getElementById('evento-proximo-evento').checked = true;
    document.getElementById('evento-acao-social').checked = false;
    document.getElementById('evento-mostrar-botao-inscricao').checked = false;

    document.getElementById('form-evento-titulo').textContent = 'Novo Evento';
    formEvento.style.display = 'block';
  });

  btnCancelarEvento.addEventListener('click', () => {
    formEvento.style.display = 'none';
    eventoForm.reset();
    eventoEditando = null;
  });

  eventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
      titulo: document.getElementById('evento-titulo').value,
      descricao: document.getElementById('evento-descricao').value,
      descricao_acao_social: document.getElementById('evento-descricao-acao').value || null,
      data_evento: document.getElementById('evento-data').value,
      data_evento_fim: document.getElementById('evento-data-fim').value || null,
      horario: document.getElementById('evento-horario').value || '',
      local: document.getElementById('evento-local').value,
      link: document.getElementById('evento-link').value || null,
      ativo: document.getElementById('evento-ativo').checked,
      proximo_evento: document.getElementById('evento-proximo-evento').checked,
      acao_social: document.getElementById('evento-acao-social').checked,
      mostrar_botao_inscricao: document.getElementById('evento-mostrar-botao-inscricao').checked
    };

    try {
      let response;
      if (eventoEditando) {
        response = await fetch(`/api/eventos/${eventoEditando.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify(dados)
        });
      } else {
        response = await fetch('/api/eventos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify(dados)
        });
      }

      if (response.ok) {
        showToast(
          eventoEditando ? 'O evento foi atualizado e já está visível no site.' : 'O evento foi criado e já está disponível no site.',
          'success',
          eventoEditando ? 'Evento Atualizado' : 'Evento Criado'
        );
        formEvento.style.display = 'none';
        eventoForm.reset();
        // Resetar checkboxes ao estado padrão
        document.getElementById('evento-ativo').checked = true;
        document.getElementById('evento-proximo-evento').checked = true;
        document.getElementById('evento-acao-social').checked = false;
        document.getElementById('evento-mostrar-botao-inscricao').checked = false;
        eventoEditando = null;
        await carregarEventos();
      } else {
        const error = await response.json();
        showToast(error.message || 'Não foi possível salvar o evento', 'error', 'Erro');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Ocorreu um erro ao salvar o evento', 'error', 'Erro');
    }
  });

  async function carregarEventos() {
    try {
      const response = await fetch('/api/eventos', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        todosEventos = result.data;
        renderizarEventos();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function renderizarEventos() {
    const tbody = document.getElementById('eventos-table');

    if (todosEventos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhum evento cadastrado</td></tr>';
      return;
    }

    tbody.innerHTML = todosEventos.map(evento => `
      <tr>
        <td>${evento.titulo}</td>
        <td>${new Date(evento.data_evento).toLocaleDateString('pt-BR')}${evento.horario ? ' - ' + evento.horario : ''}</td>
        <td>${evento.local}</td>
        <td>
          <span class="status-badge status-${evento.ativo ? 'aprovado' : 'reprovado'}">
            ${evento.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td>
          <button class="btn btn-small" onclick="editarEvento('${evento.id}')">Editar</button>
          <button class="btn btn-small" onclick="toggleEventoStatus('${evento.id}', ${!evento.ativo})">
            ${evento.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button class="btn btn-small" onclick="deletarEvento('${evento.id}')">Excluir</button>
        </td>
      </tr>
    `).join('');
  }

  window.editarEvento = (id) => {
    eventoEditando = todosEventos.find(e => e.id === id);
    if (eventoEditando) {
      document.getElementById('form-evento-titulo').textContent = 'Editar Evento';
      document.getElementById('evento-titulo').value = eventoEditando.titulo;
      document.getElementById('evento-descricao').value = eventoEditando.descricao;
      document.getElementById('evento-descricao-acao').value = eventoEditando.descricao_acao_social || '';
      document.getElementById('evento-data').value = eventoEditando.data_evento;
      document.getElementById('evento-data-fim').value = eventoEditando.data_evento_fim || '';
      document.getElementById('evento-horario').value = eventoEditando.horario || '';
      document.getElementById('evento-local').value = eventoEditando.local;
      document.getElementById('evento-link').value = eventoEditando.link || '';

      // Mostrar formulário antes de setar checkboxes
      formEvento.style.display = 'block';

      // Checkboxes - setar depois que o form está visível
      setTimeout(() => {
        // Forçar desmarcar primeiro para garantir mudança de estado
        document.getElementById('evento-ativo').checked = false;
        document.getElementById('evento-proximo-evento').checked = false;
        document.getElementById('evento-acao-social').checked = false;
        document.getElementById('evento-mostrar-botao-inscricao').checked = false;

        // Forçar repaint
        void document.getElementById('evento-proximo-evento').offsetHeight;

        // Agora setar os valores corretos
        document.getElementById('evento-ativo').checked = eventoEditando.ativo === true;
        document.getElementById('evento-proximo-evento').checked = eventoEditando.proximo_evento === true;
        document.getElementById('evento-acao-social').checked = eventoEditando.acao_social === true;
        document.getElementById('evento-mostrar-botao-inscricao').checked = eventoEditando.mostrar_botao_inscricao === true;
      }, 50);
    }
  };

  window.toggleEventoStatus = async (id, ativo) => {
    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({ ativo: ativo })
      });

      if (response.ok) {
        await carregarEventos();
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar status');
    }
  };

  window.deletarEvento = async (id) => {
    const confirmado = await showConfirm(
      'Esta ação não pode ser desfeita. O evento será permanentemente removido do sistema.',
      'Tem certeza que deseja excluir este evento?',
      'Excluir',
      'Cancelar'
    );

    if (!confirmado) {
      return;
    }

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        showToast('O evento foi excluído com sucesso', 'success', 'Evento Excluído');
        await carregarEventos();
      } else {
        showToast('Não foi possível excluir o evento', 'error', 'Erro');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Ocorreu um erro ao excluir o evento', 'error', 'Erro');
    }
  };

  // GERENCIAMENTO DE INSCRIÇÕES
  let todasInscricoes = [];
  let eventosFiltro = [];
  const filtroEvento = document.getElementById('filtro-evento');
  const exportInscricoesBtn = document.getElementById('export-inscricoes-csv-btn');

  async function carregarEventosFiltro() {
    try {
      const response = await fetch('/api/eventos', {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        eventosFiltro = result.data;

        filtroEvento.innerHTML = '<option value="">Todos os eventos</option>';
        eventosFiltro.forEach(evento => {
          const option = document.createElement('option');
          option.value = evento.id;
          option.textContent = evento.titulo;
          filtroEvento.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  filtroEvento.addEventListener('change', () => {
    carregarInscricoes();
  });

  exportInscricoesBtn.addEventListener('click', async () => {
    const eventoId = filtroEvento.value;
    const url = eventoId ? `/api/inscricoes/export/csv?evento_id=${eventoId}` : '/api/inscricoes/export/csv';

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `inscricoes_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Erro ao exportar CSV');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar CSV');
    }
  });

  async function carregarInscricoes() {
    try {
      const eventoId = filtroEvento.value;
      const url = eventoId ? `/api/inscricoes?evento_id=${eventoId}` : '/api/inscricoes';

      const response = await fetch(url, {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        todasInscricoes = result.data;
        renderizarInscricoes();
        await atualizarEstatisticasInscricoes(eventoId);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function atualizarEstatisticasInscricoes(eventoId = null) {
    try {
      const url = eventoId ? `/api/inscricoes/estatisticas?evento_id=${eventoId}` : '/api/inscricoes/estatisticas';

      const response = await fetch(url, {
        headers: {
          'Authorization': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        const stats = result.data;

        document.getElementById('stat-insc-total').textContent = stats.total;
        document.getElementById('stat-insc-pendente').textContent = stats.pendentes;
        document.getElementById('stat-insc-aprovado').textContent = stats.aprovadas;
        document.getElementById('stat-insc-reprovado').textContent = stats.reprovadas;
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function renderizarInscricoes() {
    const tbody = document.getElementById('inscricoes-table');

    if (todasInscricoes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Nenhuma inscrição encontrada</td></tr>';
      return;
    }

    tbody.innerHTML = todasInscricoes.map(inscricao => `
      <tr>
        <td>${inscricao.evento_titulo}</td>
        <td>${inscricao.nome_completo}</td>
        <td>${inscricao.cpf}</td>
        <td>${inscricao.telefone}</td>
        <td>${new Date(inscricao.data_inscricao).toLocaleString('pt-BR')}</td>
        <td>
          <span class="status-badge status-${inscricao.status}">
            ${inscricao.status.charAt(0).toUpperCase() + inscricao.status.slice(1)}
          </span>
        </td>
        <td>
          ${inscricao.status !== 'aprovado' ? `<button class="btn btn-small" onclick="aprovarInscricao('${inscricao.id}')">Aprovar</button>` : ''}
          ${inscricao.status !== 'reprovado' ? `<button class="btn btn-small" onclick="reprovarInscricao('${inscricao.id}')">Reprovar</button>` : ''}
          <button class="btn btn-small" onclick="verDetalhesInscricao('${inscricao.id}')">Detalhes</button>
        </td>
      </tr>
    `).join('');
  }

  window.aprovarInscricao = async (id) => {
    try {
      const response = await fetch(`/api/inscricoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({ status: 'aprovado' })
      });

      if (response.ok) {
        await carregarInscricoes();
      } else {
        alert('Erro ao aprovar inscrição');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao aprovar inscrição');
    }
  };

  window.reprovarInscricao = async (id) => {
    try {
      const response = await fetch(`/api/inscricoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({ status: 'reprovado' })
      });

      if (response.ok) {
        await carregarInscricoes();
      } else {
        alert('Erro ao reprovar inscrição');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao reprovar inscrição');
    }
  };

  window.verDetalhesInscricao = (id) => {
    const inscricao = todasInscricoes.find(i => i.id === id);
    if (inscricao) {
      const modal = document.getElementById('inscricao-modal');
      const body = document.getElementById('inscricao-modal-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <dl>
          <div>
            <dt>Evento</dt>
            <dd>${inscricao.evento_titulo}</dd>
          </div>
          <div>
            <dt>Nome</dt>
            <dd>${inscricao.nome_completo}</dd>
          </div>
          <div>
            <dt>CPF</dt>
            <dd>${inscricao.cpf}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>${inscricao.telefone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>${inscricao.email || 'Não informado'}</dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>${inscricao.endereco || 'Não informado'}</dd>
          </div>
          <div>
            <dt>Nº Pessoas</dt>
            <dd>${inscricao.numero_pessoas_residencia}</dd>
          </div>
          <div>
            <dt>Observações</dt>
            <dd>${inscricao.observacoes || 'Nenhuma'}</dd>
          </div>
          <div>
            <dt>Data Inscrição</dt>
            <dd>${new Date(inscricao.data_inscricao).toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span class="status-badge status-${inscricao.status}">
                ${inscricao.status.charAt(0).toUpperCase() + inscricao.status.slice(1)}
              </span>
            </dd>
          </div>
        </dl>
      `;

      modal.style.display = 'flex';
    }
  };

  const inscricaoModal = document.getElementById('inscricao-modal');
  const fecharInscricaoModalBtn = document.getElementById('fechar-inscricao-modal');
  const fecharInscricaoModalFooterBtn = document.getElementById('fechar-inscricao-modal-footer');

  function fecharInscricaoModal() {
    if (inscricaoModal) {
      inscricaoModal.style.display = 'none';
    }
  };

  if (fecharInscricaoModalBtn) {
    fecharInscricaoModalBtn.addEventListener('click', fecharInscricaoModal);
  }

  if (fecharInscricaoModalFooterBtn) {
    fecharInscricaoModalFooterBtn.addEventListener('click', fecharInscricaoModal);
  }

  // Carregar inscrições quando a aba for aberta
  const tabBtnsOriginal = document.querySelectorAll('.tab-btn');
  tabBtnsOriginal.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      if (tabName === 'inscricoes') {
        carregarEventosFiltro();
        carregarInscricoes();
      }
    });
  });

  // Carregar automaticamente na primeira vez
  if (authToken) {
    carregarEventosFiltro();
    carregarInscricoes();
  }
});
