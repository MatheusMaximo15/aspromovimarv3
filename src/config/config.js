module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  auth: {
    admin: {
      username: 'admin',
      password: 'aspromovimar2025'
    }
  },

  database: {
    type: 'json',
    jsonPath: './data/beneficiarios.json'
  },

  app: {
    name: 'ASPROMOVIMAR',
    fullName: 'Associação de Proprietários e Moradores do Vila Maria Regina',
    bairro: 'Vila Maria Regina'
  }
};
