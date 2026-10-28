const { all } = require('../database');

const listLocations = () => all('SELECT id AS localizacao_id,district AS distrito FROM locations ORDER BY district');
const listCategories = () => all('SELECT id AS categoria_id,id,name AS nome,name,icon,color AS cor FROM categories ORDER BY name');
const countAdsByCategoryAndStatus = async (status) => {
  const rows = await all('SELECT c.name,COUNT(a.id) value FROM categories c LEFT JOIN ads a ON a.category_id=c.id AND a.status=? GROUP BY c.id ORDER BY c.name', [status]);
  return Object.fromEntries(rows.map((row) => [row.name, row.value]));
};
const countAdsByStatus = async () => {
  const rows = await all('SELECT status,COUNT(*) value FROM ads GROUP BY status');
  return Object.fromEntries(rows.map((row) => [row.status, row.value]));
};

module.exports = { listLocations, listCategories, countAdsByCategoryAndStatus, countAdsByStatus };