const { get, all, run } = require('../database');

const adSelect = `SELECT a.id AS anuncio_id,a.id,a.user_id AS utilizador_id,a.category_id AS categoria_id,a.title AS titulo,a.description AS descricao,a.description AS discricao,a.price AS preco,a.image AS imagem,a.show_contact AS mostrar_contact,a.featured AS destaque,a.condition AS condicao,a.status AS estado,a.status AS status,a.views AS visualizacao,a.views AS views,a.created_at AS data_hora,c.name AS categoria FROM ads a JOIN categories c ON c.id=a.category_id`;
const listAds = (where = '', params = [], tail = '') => all(`${adSelect} ${where} ${tail}`, params);
const findAdRow = (id) => get(`${adSelect} WHERE a.id=?`, [id]);

async function findAdDetails(id) {
  const row = await findAdRow(id);
  if (!row) return null;
  const owner = await get('SELECT id AS user_id,name AS nome,email,phone AS telemovel,image FROM users WHERE id=?', [row.utilizador_id]);
  const location = await get('SELECT district AS distrito FROM locations WHERE id=(SELECT location_id FROM users WHERE id=?)', [row.utilizador_id]);
  return { ...row, utilizador: { ...owner, imagem: owner?.image || null, localizacao: location || null }, localizacao: location || null };
}

const getFeaturedAds = () => listAds("WHERE a.status='active'", [], 'ORDER BY a.featured DESC,a.views DESC,a.created_at DESC LIMIT 12');
const getMostViewedAds = (limit = 30) => listAds("WHERE a.status='active'", [], `ORDER BY a.views DESC LIMIT ${Math.max(1, Math.min(100, Number(limit) || 30))}`);
const getAdsByCategory = (categoryId) => listAds("WHERE a.status='active' AND a.category_id=?", [categoryId], 'ORDER BY a.created_at DESC');
const getAdsByUser = (userId) => listAds('WHERE a.user_id=?', [userId], 'ORDER BY a.created_at DESC');
const incrementViews = (id) => run("UPDATE ads SET views=views+1 WHERE id=? AND status='active'", [id]);

const createAd = (data) => run(
  'INSERT INTO ads(user_id,category_id,title,description,price,image,show_contact,featured,condition,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
  data
);
const updateAd = (data) => run(
  'UPDATE ads SET title=?,description=?,price=?,show_contact=?,featured=?,category_id=?,status=?,image=? WHERE id=?',
  data
);
async function listAdminAds() {
  const rows = await all('SELECT a.id,a.user_id,a.title,a.description,a.price,a.status,a.views,a.image,a.show_contact,a.featured,a.category_id,c.name AS category,u.name AS user FROM ads a JOIN categories c ON c.id=a.category_id JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC');
  return rows.map((row) => ({ ...row, price: Number(row.price), views: Number(row.views), show_contact: Boolean(row.show_contact), featured: Boolean(row.featured) }));
}
const getAdOwner = (id) => get('SELECT user_id FROM ads WHERE id=?', [id]);
const updateAdminStatus = (id, status) => run('UPDATE ads SET status=? WHERE id=?', [status, id]);

module.exports = { adSelect, listAds, findAdRow, findAdDetails, getFeaturedAds, getMostViewedAds, getAdsByCategory, getAdsByUser, incrementViews, createAd, updateAd, listAdminAds, getAdOwner, updateAdminStatus };