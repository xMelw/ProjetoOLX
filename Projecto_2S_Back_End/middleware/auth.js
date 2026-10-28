const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'anuncios-tuga-local-development-secret';

function authenticate(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Inicie sessão para continuar.' });
  try { req.user = jwt.verify(token, secret); return next(); }
  catch { return res.status(401).json({ message: 'Sessão inválida ou expirada.' }); }
}
function requireAdmin(req, res, next) {
  return req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Acesso reservado à administração.' });
}
module.exports = { secret, authenticate, requireAdmin };