const { all, get, run } = require('../database');

async function listConversations(userId, seller) {
  const filter = seller ? 'a.user_id=? AND m.sender_id<>?' : 'm.sender_id=? AND a.user_id<>?';
  const rows = await all(`SELECT a.id AS anuncio_id,a.title AS anuncio,a.image AS imagem,a.price AS preco,a.user_id AS id_anunciante,other.id AS id_solicitante,other.name AS utilizador_nome,other.id AS utilizador_id,SUM(CASE WHEN m.recipient_id=? AND m.is_read=0 THEN 1 ELSE 0 END) AS mensagens_novas,MAX(m.created_at) AS ultima_mensagem FROM messages m JOIN ads a ON a.id=m.ad_id JOIN users other ON other.id=CASE WHEN a.user_id=? THEN m.sender_id ELSE a.user_id END WHERE ${filter} GROUP BY a.id,other.id ORDER BY ultima_mensagem DESC`, [userId,userId,userId,userId]);
  return rows.map((row) => ({ ...row, utilizador: { nome: row.utilizador_nome } }));
}

async function listChatMessages(adId, currentId, otherId) {
  const rows = await all('SELECT m.*,s.name AS sender_name,s.image AS sender_image,a.user_id AS seller_id FROM messages m JOIN users s ON s.id=m.sender_id JOIN ads a ON a.id=m.ad_id WHERE m.ad_id=? AND ((m.sender_id=? AND m.recipient_id=?) OR (m.sender_id=? AND m.recipient_id=?)) ORDER BY m.created_at,m.id', [adId,currentId,otherId,otherId,currentId]);
  return rows.map((message) => ({ id: message.id, de: message.sender_id === message.seller_id ? 'a' : 's', imagem: message.sender_image || null, user: message.sender_name, data_hora: message.created_at, mensagem: message.body, nova: !message.is_read }));
}
const getAdOwner = (adId) => get('SELECT user_id FROM ads WHERE id=?', [adId]);
const markRead = (adId, recipientId) => run('UPDATE messages SET is_read=1 WHERE ad_id=? AND recipient_id=?', [adId, recipientId]);
const createMessage = (adId, senderId, recipientId, body) => run('INSERT INTO messages(ad_id,sender_id,recipient_id,body) VALUES (?,?,?,?)', [adId,senderId,recipientId,body]);
module.exports = { listConversations, listChatMessages, getAdOwner, markRead, createMessage };