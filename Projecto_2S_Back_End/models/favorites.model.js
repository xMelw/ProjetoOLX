const { all, run } = require('../database');
const listFavorites = (userId) => all('SELECT ad_id AS anuncio_id,user_id AS utilizador_id FROM favorites WHERE user_id=? ORDER BY created_at DESC', [userId]);
const addFavorite = (userId, adId) => run('INSERT OR IGNORE INTO favorites(user_id,ad_id) VALUES (?,?)', [userId, adId]);
const removeFavorite = (userId, adId) => run('DELETE FROM favorites WHERE user_id=? AND ad_id=?', [userId, adId]);
module.exports = { listFavorites, addFavorite, removeFavorite };