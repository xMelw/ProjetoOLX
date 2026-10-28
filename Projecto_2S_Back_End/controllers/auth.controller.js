const jwt = require('jsonwebtoken');
const { secret } = require('../middleware/auth');
const authModel = require('../models/auth.model');
async function register(req,res) {
  const { nome,email,password,telemovel } = req.body;
  if (!nome?.trim() || !email?.trim() || !password || !telemovel?.trim()) return res.status(400).json({ message:'Preencha nome, email, palavra-passe e telemóvel.' });
  if (String(password).length < 8) return res.status(400).json({ message:'A palavra-passe deve ter pelo menos 8 caracteres.' });
  const normalizedEmail=email.trim().toLowerCase();
  if (await authModel.findUserByEmail(normalizedEmail)) return res.status(409).json({ message:'Este email já está registado.' });
  const user=await authModel.createUser({ name:nome.trim(),email:normalizedEmail,password,phone:String(telemovel).trim() });
  return res.status(201).json({ message:'Registo submetido para aprovação.',utilizador_id:user.id,status:'pending' });
}
async function login(req,res) {
  const user=await authModel.findUserByEmail(req.body.email);
  if (!user || !authModel.passwordMatches(req.body.password,user.password_salt,user.password_hash)) return res.status(401).json({ message:'Email ou palavra-passe incorretos.' });
  if (user.status!=='active') return res.status(403).json({ message:user.status==='pending'?'A conta aguarda aprovação da administração.':'Esta conta está suspensa.' });
  const token=jwt.sign({ id:user.id,role:user.role },secret,{ expiresIn:'7d' });
  res.cookie('token',token,{ httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*86400000 });
  return res.json({ utilizador_id:user.id,nome:user.name,role:user.role,status:user.status });
}
const logout=(_req,res)=>res.clearCookie('token').json({ message:'Sessão terminada.' });
module.exports={ register,login,logout };