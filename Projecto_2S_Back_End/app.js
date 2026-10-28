require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { uploadDir } = require('./middleware/upload');
const routes = ['catalog', 'auth', 'user', 'ads', 'favorite', 'feedback', 'message']
  .map((name) => require(`./routes/${name}.routes`));
const adminRoutes = require('./routes/admin.routes');

const app = express();
const configuredFrontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isLocalFrontendOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    const allowed = !origin
      || origin === configuredFrontendOrigin
      || (process.env.NODE_ENV !== 'production' && isLocalFrontendOrigin(origin));
    callback(allowed ? null : new Error('Origem não permitida.'), allowed);
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));
app.use(...routes);
app.use('/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message });
  return res.status(500).json({ message: 'Erro interno do servidor.' });
});

module.exports = app;