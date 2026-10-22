require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./database');

const port = Number(process.env.PORT || 5000);
initializeDatabase()
  .then(() => app.listen(port, () => console.log(`API Anúncios Tuga disponível em http://localhost:${port}`)))
  .catch((error) => { console.error('Não foi possível iniciar a base de dados:', error); process.exit(1); });
