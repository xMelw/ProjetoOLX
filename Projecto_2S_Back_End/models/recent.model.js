const { all, run } = require('../database');
const addRecentView = (userId, adId) => run('INSERT INTO recent_views(user_id,ad_id) VALUES (?,?)', [userId, adId]);
const listRecentViews = (userId) => all('SELECT r.id,r.viewed_at AS data_hora,a.title AS anuncio,a.title AS titulo,a.id AS anuncio_id FROM recent_views r JOIN ads a ON a.id=r.ad_id WHERE r.user_id=? ORDER BY r.viewed_at DESC LIMIT 100', [userId]);
const removeOlderThanDays = (days) => run("DELETE FROM recent_views WHERE viewed_at < datetime('now',?)", [`-${Math.max(0, Number(days) || 0)} days`]);
module.exports = { addRecentView, listRecentViews, removeOlderThanDays };