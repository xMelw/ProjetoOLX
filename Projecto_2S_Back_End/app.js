require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { run, get, all, hashPassword } = require('./database');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) });
const secret = process.env.JWT_SECRET || 'anuncios-tuga-local-development-secret';
const imageUrl = (file) => file || 'placeholder.png';
const adSelect = `SELECT a.id AS anuncio_id, a.id, a.user_id AS utilizador_id, a.category_id AS categoria_id, a.title AS titulo, a.description AS descricao, a.description AS discricao, a.price AS preco, a.image AS imagem, a.show_contact AS mostrar_contact, a.featured AS destaque, a.condition AS condicao, a.status AS estado, a.status AS status, a.views AS visualizacao, a.views AS views, a.created_at AS data_hora, c.name AS categoria FROM ads a JOIN categories c ON c.id=a.category_id`;
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const idOf = (req) => Number(req.user?.id);
const auth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Inicie sessão para continuar.' });
  try { req.user = jwt.verify(token, secret); next(); } catch { res.status(401).json({ message: 'Sessão inválida ou expirada.' }); }
};
const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Acesso reservado à administração.' });
const passwordMatches = (password, salt, expected) => crypto.scryptSync(password, salt, 64).toString('hex') === expected;
const adRows = (where = '', params = [], tail = '') => all(`${adSelect} ${where} ${tail}`, params);
const mapAd = (a) => ({ ...a, imagem: imageUrl(a.imagem), preco: Number(a.preco), visualizacao: Number(a.visualizacao), destaque: Boolean(a.destaque), mostrar_contact: Boolean(a.mostrar_contact) });
const lookupAd = async (id) => {
  const row = await get(`${adSelect} WHERE a.id=?`, [id]);
  if (!row) return null;
  const owner = await get('SELECT id AS user_id,name AS nome,email,phone AS telemovel,image FROM users WHERE id=?', [row.utilizador_id]);
  const location = await get('SELECT district AS distrito FROM locations WHERE id=(SELECT location_id FROM users WHERE id=?)', [row.utilizador_id]);
  row.utilizador = { ...owner, imagem: owner?.image || null };
  row.utilizador.localizacao = location || null;
  row.localizacao = location || null;
  const mapped = mapAd(row);
  mapped.categoria = { nome: row.categoria, id: row.categoria_id };
  return mapped;
};
const publicUser = (u) => ({ id: u.id, user_id: u.id, utilizador_id: u.id, nome: u.name, name: u.name, email: u.email, telemovel: u.phone, phone: u.phone, status: u.status, role: u.role, imagem: u.image || null, localizacao_id: u.location_id, localizacao: u.district || null, created_at: u.created_at });

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'anuncios-tuga-api' }));

// Autenticação, utilizadores e localizações
app.post('/registro', asyncRoute(async (req, res) => {
  const { nome, email, password, telemovel } = req.body;
  if (!nome?.trim() || !email?.trim() || !password || !telemovel?.trim()) return res.status(400).json({ message: 'Preencha nome, email, palavra-passe e telemóvel.' });
  if (String(password).length < 8) return res.status(400).json({ message: 'A palavra-passe deve ter pelo menos 8 caracteres.' });
  if (await get('SELECT id FROM users WHERE email=?', [email.trim()])) return res.status(409).json({ message: 'Este email já está registado.' });
  const pwd = hashPassword(String(password));
  const result = await run('INSERT INTO users(name,email,password_hash,password_salt,phone,status) VALUES (?,?,?,?,?,?)', [nome.trim(),email.trim().toLowerCase(),pwd.hash,pwd.salt,String(telemovel).trim(),'pending']);
  res.status(201).json({ message: 'Registo submetido para aprovação.', utilizador_id: result.id, status: 'pending' });
}));
app.post('/login', asyncRoute(async (req, res) => {
  const user = await get('SELECT * FROM users WHERE email=?', [String(req.body.email || '').trim()]);
  if (!user || !passwordMatches(String(req.body.password || ''), user.password_salt, user.password_hash)) return res.status(401).json({ message: 'Email ou palavra-passe incorretos.' });
  if (user.status !== 'active') return res.status(403).json({ message: user.status === 'pending' ? 'A conta aguarda aprovação da administração.' : 'Esta conta está suspensa.' });
  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 86400000 });
  res.json({ utilizador_id: user.id, nome: user.name, role: user.role, status: user.status });
}));
app.post('/logout', (_req, res) => res.clearCookie('token').json({ message: 'Sessão terminada.' }));
app.get('/localizacoes', asyncRoute(async (_req, res) => res.json((await all('SELECT id AS localizacao_id,district AS distrito FROM locations ORDER BY district')))));
app.get('/categorias', asyncRoute(async (_req, res) => res.json(await all('SELECT id AS categoria_id,id,name AS nome,name,icon,color AS cor FROM categories ORDER BY name'))));
app.get('/utilizador/nome/:id', asyncRoute(async (req, res) => {
  const user = await get('SELECT name AS nome FROM users WHERE id=?', [req.params.id]);
  user ? res.json(user) : res.status(404).json({ message: 'Utilizador não encontrado.' });
}));
app.get('/utilizador/:id', auth, asyncRoute(async (req, res) => {
  if (idOf(req) !== Number(req.params.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Sem autorização.' });
  const u = await get('SELECT u.*,l.district FROM users u LEFT JOIN locations l ON l.id=u.location_id WHERE u.id=?',[req.params.id]);
  u ? res.json(publicUser(u)) : res.status(404).json({ message: 'Utilizador não encontrado.' });
}));
app.put('/utilizador/atualizar', auth, upload.single('imagem'), asyncRoute(async (req, res) => {
  const requestedId = Number(req.body.id || idOf(req));
  if (requestedId !== idOf(req) && req.user.role !== 'admin') return res.status(403).json({ message: 'Sem autorização.' });
  const existing = await get('SELECT * FROM users WHERE id=?',[requestedId]);
  if (!existing) return res.status(404).json({ message: 'Utilizador não encontrado.' });
  let locationId = existing.location_id;
  if (req.body.distrito) locationId = Number(req.body.distrito) || (await get('SELECT id FROM locations WHERE district=?',[req.body.distrito]))?.id || null;
  await run('UPDATE users SET name=?,email=?,phone=?,location_id=?,image=? WHERE id=?',[req.body.nome || existing.name,req.body.email || existing.email,req.body.telemovel || existing.phone,locationId,req.file?.filename || existing.image,requestedId]);
  res.json({ message: 'Perfil atualizado.' });
}));

// Anúncios públicos e operações do utilizador
app.get('/anuncios/destaque', asyncRoute(async (_req, res) => res.json((await adRows("WHERE a.status='active' AND a.featured=1", [], 'ORDER BY a.created_at DESC')).map(mapAd))));
app.get('/anuncios/maisvistos/top30', asyncRoute(async (_req, res) => res.json((await adRows("WHERE a.status='active'", [], 'ORDER BY a.views DESC LIMIT 30')).map(mapAd))));
app.get('/anuncios/categoria/:id', asyncRoute(async (req, res) => res.json((await adRows("WHERE a.status='active' AND a.category_id=?",[req.params.id],'ORDER BY a.created_at DESC')).map(mapAd))));
app.get('/anuncios/utilizador/:id', auth, asyncRoute(async (req, res) => {
  if (idOf(req) !== Number(req.params.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Sem autorização.' });
  const labels = { active: 'ativo', pending: 'pendente', sold: 'terminado', removed: 'excluido' };
  res.json((await adRows('WHERE a.user_id=?',[req.params.id],'ORDER BY a.created_at DESC')).map((ad) => ({ ...mapAd(ad), estado: labels[ad.estado] || ad.estado })));
}));
app.get('/anuncios/:id', asyncRoute(async (req, res) => {
  const ad = await lookupAd(req.params.id);
  ad ? res.json(ad) : res.status(404).json({ message: 'Anúncio não encontrado.' });
}));
app.post('/anuncios/visualizar/:id', asyncRoute(async (req, res) => {
  await run("UPDATE ads SET views=views+1 WHERE id=? AND status='active'",[req.params.id]);
  res.json({ ok: true });
}));
app.post('/anuncios/criar', auth, upload.single('imagem'), asyncRoute(async (req, res) => {
  const { titulo, categoria_id, preco, discricao, descricao } = req.body;
  if (!titulo || !categoria_id || !Number.isFinite(Number(preco)) || Number(preco) < 0 || !(discricao || descricao)) return res.status(400).json({ message: 'Dados do anúncio inválidos.' });
  const result = await run('INSERT INTO ads(user_id,category_id,title,description,price,image,show_contact,featured,condition,status) VALUES (?,?,?,?,?,?,?,?,?,?)',[idOf(req),Number(categoria_id),titulo.trim(),discricao || descricao,Number(preco),req.file?.filename || 'placeholder.png',req.body.mostrar_contact === 'false' || req.body.mostrar_contact === '0' ? 0 : 1,0,req.body.estado || 'Usado','pending']);
  res.status(201).json({ message: 'Anúncio enviado para aprovação.', anuncio_id: result.id });
}));
app.put('/anuncios/editar', auth, upload.single('imagem'), asyncRoute(async (req, res) => {
  const adId = Number(req.body.anuncio_id);
  const ad = await get('SELECT * FROM ads WHERE id=?',[adId]);
  if (!ad || (ad.user_id !== idOf(req) && req.user.role !== 'admin')) return res.status(404).json({ message: 'Anúncio não encontrado.' });
  await run('UPDATE ads SET title=?,description=?,price=?,show_contact=?,featured=?,category_id=?,status=?,image=? WHERE id=?',[req.body.titulo || ad.title,req.body.discricao || req.body.descricao || ad.description,Number(req.body.preco ?? ad.price),req.body.mostrar_contact === 'false' ? 0 : Number(req.body.mostrar_contact ?? ad.show_contact),req.user.role === 'admin' ? Number(req.body.destaque ?? ad.featured) : ad.featured,Number(req.body.categoria_id || ad.category_id),req.body.vendido === 'true' || req.body.vendido === '1' ? 'sold' : ad.status,req.file?.filename || ad.image,adId]);
  res.json({ message: 'Anúncio atualizado.' });
}));

// Favoritos, histórico, mensagens e feedback
app.get('/favoritos/:userId', auth, asyncRoute(async (req, res) => {
  if (idOf(req) !== Number(req.params.userId) && req.user.role !== 'admin') return res.status(403).json({ message: 'Sem autorização.' });
  res.json(await all('SELECT ad_id AS anuncio_id,user_id AS utilizador_id FROM favorites WHERE user_id=? ORDER BY created_at DESC',[req.params.userId]));
}));
app.post('/favoritos', auth, asyncRoute(async (req, res) => {
  const adId = Number(req.body.anuncio_id), userId = Number(req.body.utilizador_id || idOf(req));
  if (userId !== idOf(req)) return res.status(403).json({ message: 'Sem autorização.' });
  await run('INSERT OR IGNORE INTO favorites(user_id,ad_id) VALUES (?,?)',[userId,adId]); res.status(201).json({ ok: true });
}));
app.delete('/favoritos', auth, asyncRoute(async (req, res) => {
  const adId = Number(req.body.anuncio_id), userId = Number(req.body.utilizador_id || idOf(req));
  if (userId !== idOf(req)) return res.status(403).json({ message: 'Sem autorização.' });
  await run('DELETE FROM favorites WHERE user_id=? AND ad_id=?',[userId,adId]); res.json({ ok: true });
}));
app.post('/recentes', auth, asyncRoute(async (req, res) => { await run('INSERT INTO recent_views(user_id,ad_id) VALUES (?,?)',[idOf(req),Number(req.body.anuncio_id)]); res.status(201).json({ ok: true }); }));
app.get('/feedbacks/media/:id', asyncRoute(async (req, res) => {
  const row = await get("SELECT ROUND(AVG(rating),1) AS media,COUNT(*) AS total FROM feedback WHERE reviewed_user_id=? AND status='active'",[req.params.id]);
  res.json({ media: row.media || 0, media_feedback: row.media || 0, total: row.total });
}));
app.get('/feedbacks/recebidos', asyncRoute(async (req, res) => res.json(await all("SELECT f.id AS feedback_id,f.rating AS classificacao,f.review AS review,f.created_at AS data_hora,u.name AS anunciante_nome FROM feedback f JOIN users u ON u.id=f.reviewer_id WHERE f.reviewed_user_id=? AND f.status='active' ORDER BY f.created_at DESC",[req.query.utilizador_id]))));
const conversationsFor = async (uid, seller) => {
  const rows = await all(`SELECT a.id AS anuncio_id,a.title AS anuncio,a.image AS imagem,a.price AS preco,a.user_id AS id_anunciante,other.id AS id_solicitante,other.name AS utilizador_nome,other.id AS utilizador_id, SUM(CASE WHEN m.recipient_id=? AND m.is_read=0 THEN 1 ELSE 0 END) AS mensagens_novas,MAX(m.created_at) AS ultima_mensagem FROM messages m JOIN ads a ON a.id=m.ad_id JOIN users other ON other.id=CASE WHEN a.user_id=? THEN m.sender_id ELSE a.user_id END WHERE ${seller ? 'a.user_id=? AND m.sender_id<>?' : 'm.sender_id=? AND a.user_id<>?'} GROUP BY a.id,other.id ORDER BY ultima_mensagem DESC`,[uid,uid,uid,uid]);
  return rows.map(r => ({ ...r, imagem:imageUrl(r.imagem), utilizador:{ nome:r.utilizador_nome } }));
};
app.get('/mensagens/anunciante', auth, asyncRoute(async (req, res) => res.json(await conversationsFor(idOf(req),true))));
app.get('/mensagens/solicitante', auth, asyncRoute(async (req, res) => res.json(await conversationsFor(idOf(req),false))));
const chatRows = async (adId, currentId, otherId) => {
  const rows = await all(`SELECT m.*,s.name AS sender_name,s.image AS sender_image,a.user_id AS seller_id FROM messages m JOIN users s ON s.id=m.sender_id JOIN ads a ON a.id=m.ad_id WHERE m.ad_id=? AND ((m.sender_id=? AND m.recipient_id=?) OR (m.sender_id=? AND m.recipient_id=?)) ORDER BY m.created_at,m.id`,[adId,currentId,otherId,otherId,currentId]);
  return rows.map(m => ({ id:m.id,de:m.sender_id===m.seller_id?'a':'s',imagem:m.sender_image?imageUrl(m.sender_image):null,user:m.sender_name,data_hora:m.created_at,mensagem:m.body,nova:!m.is_read }));
};
app.get('/mensagens/anunciante/chat/:adId/:otherId', auth, asyncRoute(async (req, res) => {
  const ad = await get('SELECT user_id FROM ads WHERE id=?',[req.params.adId]);
  if (!ad || ad.user_id !== idOf(req)) return res.status(403).json({ message: 'Sem autorização.' });
  res.json(await chatRows(req.params.adId,idOf(req),Number(req.params.otherId)));
}));
app.get('/mensagens/solicitante/chat/:adId', auth, asyncRoute(async (req, res) => {
  const ad = await get('SELECT user_id FROM ads WHERE id=?',[req.params.adId]);
  if (!ad) return res.status(404).json({ message: 'Anúncio não encontrado.' });
  res.json(await chatRows(req.params.adId,idOf(req),ad.user_id));
}));
app.put('/mensagens/marcar_lidos', auth, asyncRoute(async (req, res) => { await run('UPDATE messages SET is_read=1 WHERE ad_id=? AND recipient_id=?',[Number(req.body.anuncio_id),idOf(req)]); res.json({ ok:true }); }));
const sendMessage = async (req, res, recipientId) => {
  const adId=Number(req.body.anuncio_id), ad=await get('SELECT user_id FROM ads WHERE id=?',[adId]);
  if (!ad || !req.body.mensagem?.trim()) return res.status(400).json({ message:'Mensagem ou anúncio inválido.' });
  const sender=idOf(req); const recipient=recipientId || ad.user_id;
  if (sender===recipient) return res.status(400).json({ message:'Não pode enviar mensagem para si próprio.' });
  await run('INSERT INTO messages(ad_id,sender_id,recipient_id,body) VALUES (?,?,?,?)',[adId,sender,recipient,req.body.mensagem.trim()]); res.status(201).json({ ok:true });
};
app.post('/mensagens/enviar_mensagem_anuncio', auth, asyncRoute(async (req,res)=>sendMessage(req,res)));
app.post('/mensagens/resposta', auth, asyncRoute(async (req,res)=>{
  const ad=await get('SELECT user_id FROM ads WHERE id=?',[req.body.anuncio_id]);
  if (!ad || ad.user_id!==idOf(req)) return res.status(403).json({message:'Sem autorização.'});
  return sendMessage(req,res,Number(req.body.utilizador_id));
}));

// Administração (todos os endpoints protegidos por sessão de administrador)
app.use('/admin', auth, admin);
app.get('/admin/stats', asyncRoute(async (_req,res)=>{
  const users=await get("SELECT COUNT(*) total, SUM(status='banned') banned FROM users"); const ads=await get("SELECT COUNT(*) total,SUM(status='active') active,SUM(status='pending') pending,SUM(views) views FROM ads"); const today=await get("SELECT COUNT(*) total FROM recent_views WHERE date(viewed_at)=date('now','localtime')");
  res.json({totalUsers:users.total,totalAds:ads.total,totalViews:ads.views||0,totalRevenue:0,activeAds:ads.active||0,pendingAds:ads.pending||0,bannedUsers:users.banned||0,todayViews:today.total||0});
}));
app.get('/admin/users/:status', asyncRoute(async (req,res)=>{
  const status=req.params.status; const where=status==='all'?'':'WHERE u.status=?';
  const rows=await all(`SELECT u.id,u.id AS user_id,u.name,u.name AS nome,u.email,u.phone AS telemovel,u.status,u.status AS estado,u.role,u.created_at FROM users u ${where} ORDER BY u.created_at DESC`,status==='all'?[]:[status]); res.json(rows);
}));
app.get('/admin/user/:id', asyncRoute(async(req,res)=>{const u=await get('SELECT id,name,email,phone AS telemovel,status,role FROM users WHERE id=?',[req.params.id]); u?res.json(u):res.status(404).json({message:'Utilizador não encontrado.'});}));
app.put('/admin/user/estado/:id', asyncRoute(async(req,res)=>{const status=req.body.estado;if(!['active','pending','banned'].includes(status))return res.status(400).json({message:'Estado inválido.'});await run('UPDATE users SET status=? WHERE id=?',[status,req.params.id]);res.json({ok:true});}));
app.post('/admin/user/registar', asyncRoute(async(req,res)=>{const name=req.body.name||req.body.nome,email=req.body.email,password=req.body.password,status=req.body.status||'active';if(!name||!email||!password)return res.status(400).json({message:'Dados incompletos.'});const pwd=hashPassword(password);const row=await run('INSERT INTO users(name,email,password_hash,password_salt,status) VALUES (?,?,?,?,?)',[name,email,pwd.hash,pwd.salt,status]);res.status(201).json({id:row.id,name,email,status});}));
app.get('/admin/totais_anuncios/por-categoria/:status',asyncRoute(async(req,res)=>{const rows=await all('SELECT c.name,COUNT(a.id) value FROM categories c LEFT JOIN ads a ON a.category_id=c.id AND a.status=? GROUP BY c.id ORDER BY c.name',[req.params.status]);res.json(Object.fromEntries(rows.map(r=>[r.name,r.value])));}));
app.get('/admin/totais_anuncios/por-estado',asyncRoute(async(_req,res)=>{const rows=await all('SELECT status,COUNT(*) value FROM ads GROUP BY status');res.json(Object.fromEntries(rows.map(r=>[r.status,r.value])));}));
app.put('/admin/mudar_estado_anuncio',asyncRoute(async(req,res)=>{const state=req.body.estado;if(!['active','pending','sold','removed'].includes(state))return res.status(400).json({message:'Estado inválido.'});await run('UPDATE ads SET status=? WHERE id=?',[state,req.body.adId]);res.json({ok:true});}));
app.get('/admin/ads/all',asyncRoute(async(_req,res)=>res.json((await adRows('',[],'ORDER BY a.created_at DESC')).map(a=>({...mapAd(a),id:a.id,name:a.titulo,description:a.descricao,price:a.preco,status:a.status,user_id:a.utilizador_id,category:a.categoria})))));
app.get('/admin/recentes/:userId',asyncRoute(async(req,res)=>res.json(await all('SELECT r.id,r.viewed_at AS data_hora,a.title AS anuncio,a.title AS titulo,a.id AS anuncio_id FROM recent_views r JOIN ads a ON a.id=r.ad_id WHERE r.user_id=? ORDER BY r.viewed_at DESC LIMIT 100',[req.params.userId]))));
app.delete('/admin/recentes/apagar/:days',asyncRoute(async(req,res)=>{await run("DELETE FROM recent_views WHERE viewed_at < datetime('now',?)",[`-${Math.max(0,Number(req.params.days)||0)} days`]);res.json({ok:true});}));
app.put('/admin/feedback/mudar_estado',asyncRoute(async(req,res)=>{if(!['active','pending','hidden'].includes(req.body.estado))return res.status(400).json({message:'Estado inválido.'});await run('UPDATE feedback SET status=? WHERE id=?',[req.body.estado,req.body.feedbackId]);res.json({ok:true});}));
app.get('/admin/feedback/estado/:status',asyncRoute(async(req,res)=>res.json(await all('SELECT f.id,f.id AS feedback_id,f.rating AS classificacao,f.review,f.status,f.status AS estado,f.created_at AS data_hora,r.name AS anunciante_nome,u.name AS utilizador_nome FROM feedback f JOIN users r ON r.id=f.reviewer_id JOIN users u ON u.id=f.reviewed_user_id WHERE f.status=? ORDER BY f.created_at DESC',[req.params.status]))));
app.get('/admin/feedback/totais-por-estado',asyncRoute(async(_req,res)=>{const rows=await all('SELECT status,COUNT(*) total FROM feedback GROUP BY status');res.json(Object.fromEntries(rows.map(r=>[r.status,r.total])));}));

app.use((req,res)=>res.status(404).json({message:`Rota não encontrada: ${req.method} ${req.path}`}));
app.use((error,_req,res,_next)=>{console.error(error);if(error instanceof multer.MulterError)return res.status(400).json({message:error.message});res.status(500).json({message:'Erro interno do servidor.'});});

module.exports = app;
