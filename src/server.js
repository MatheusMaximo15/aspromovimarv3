const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const beneficiarioRoutes = require('./api/routes/beneficiarioRoutes');
const contentRoutes = require('./api/routes/contentRoutes');
const inscricaoRoutes = require('./api/routes/inscricaoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', beneficiarioRoutes);
app.use('/api', contentRoutes);
app.use('/api', inscricaoRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'cadastro.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.get('/noticias/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'noticia.html'));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`  ASPROMOVIMAR - Sistema Web`);
  console.log(`===========================================`);
  console.log(`  Servidor rodando em: http://${HOST}:${PORT}`);
  console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===========================================\n`);
});

module.exports = app;
