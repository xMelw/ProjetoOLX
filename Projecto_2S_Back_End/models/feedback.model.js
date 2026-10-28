const { get, all, run } = require('../database');
const getAverageForUser = (id) => get("SELECT ROUND(AVG(rating),1) AS media,COUNT(*) AS total FROM feedback WHERE reviewed_user_id=? AND status='active'", [id]);
const listReceived = (id) => all("SELECT f.id AS feedback_id,f.rating AS classificacao,f.review AS review,f.created_at AS data_hora,u.name AS anunciante_nome FROM feedback f JOIN users u ON u.id=f.reviewer_id WHERE f.reviewed_user_id=? AND f.status='active' ORDER BY f.created_at DESC", [id]);
const updateStatus = (id, status) => run('UPDATE feedback SET status=? WHERE id=?', [status, id]);
const listByStatus = (status) => all('SELECT f.id,f.id AS feedback_id,f.rating AS classificacao,f.review,f.status,f.status AS estado,f.created_at AS data_hora,r.name AS anunciante_nome,u.name AS utilizador_nome FROM feedback f JOIN users r ON r.id=f.reviewer_id JOIN users u ON u.id=f.reviewed_user_id WHERE f.status=? ORDER BY f.created_at DESC', [status]);
const getTotalsByStatus = async () => {
  const rows = await all('SELECT status,COUNT(*) total FROM feedback GROUP BY status');
  return Object.fromEntries(rows.map((row) => [row.status, row.total]));
};
module.exports = { getAverageForUser, listReceived, updateStatus, listByStatus, getTotalsByStatus };