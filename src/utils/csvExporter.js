function exportarParaCSV(beneficiarios) {
  if (!beneficiarios || beneficiarios.length === 0) {
    return 'Nome Completo,CPF,Endereço,Telefone,Número de Pessoas,Situação Atual,Email,Data Cadastro,Status\n';
  }

  const headers = [
    'Nome Completo',
    'CPF',
    'Endereço',
    'Telefone',
    'Número de Pessoas',
    'Situação Atual',
    'Email',
    'Data Cadastro',
    'Status',
    'Ação'
  ];

  const rows = beneficiarios.map(b => {
    return [
      b.nome_completo || '',
      b.cpf || '',
      b.endereco || '',
      b.telefone || '',
      b.numero_pessoas_residencia || '',
      b.situacao_atual || '',
      b.email || '',
      b.data_cadastro ? new Date(b.data_cadastro).toLocaleString('pt-BR') : '',
      b.status_inscricao || '',
      b.acao || ''
    ].map(field => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

module.exports = {
  exportarParaCSV
};
