const config = require('../../config/config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária'
    });
  }

  const [type, credentials] = authHeader.split(' ');

  if (type !== 'Basic') {
    return res.status(401).json({
      success: false,
      message: 'Tipo de autenticação inválido'
    });
  }

  const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  if (
    username === config.auth.admin.username &&
    password === config.auth.admin.password
  ) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Credenciais inválidas'
  });
}

module.exports = authMiddleware;
