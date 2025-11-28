document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('cadastro-form');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const eventoSelect = document.getElementById('evento_id');

  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');

  // Carregar eventos ativos
  await carregarEventos();

  cpfInput.addEventListener('input', (e) => {
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

  telefoneInput.addEventListener('input', (e) => {
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

  function validarCPF(cpf) {
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

  function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarSucesso(mensagem) {
    successMessage.textContent = mensagem;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function carregarEventos() {
    try {
      const response = await fetch('/api/eventos?proximos=true');

      if (response.ok) {
        const result = await response.json();
        const eventos = result.data.filter(e => e.ativo);

        if (eventos.length === 0) {
          eventoSelect.innerHTML = '<option value="">Nenhum evento disponível no momento</option>';
          return;
        }

        eventoSelect.innerHTML = '<option value="">Selecione um evento</option>';

        eventos.forEach(evento => {
          const option = document.createElement('option');
          option.value = evento.id;
          const dataEvento = new Date(evento.data_evento).toLocaleDateString('pt-BR');
          option.textContent = `${evento.titulo} - ${dataEvento}`;
          eventoSelect.appendChild(option);
        });
      } else {
        eventoSelect.innerHTML = '<option value="">Erro ao carregar eventos</option>';
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      eventoSelect.innerHTML = '<option value="">Erro ao carregar eventos</option>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.evento_id) {
      mostrarErro('Por favor, selecione um evento.');
      return;
    }

    if (!validarCPF(data.cpf)) {
      mostrarErro('CPF inválido. Por favor, verifique o número digitado.');
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
      email: data.email || null
    };

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inscricaoData)
      });

      const result = await response.json();

      if (response.ok) {
        mostrarSucesso('Inscrição realizada com sucesso! Aguarde a análise e você receberá mais informações em breve.');
        form.reset();
        await carregarEventos(); // Recarregar eventos após reset
      } else {
        mostrarErro(result.message || 'Erro ao realizar inscrição. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      mostrarErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar Cadastro';
    }
  });
});
