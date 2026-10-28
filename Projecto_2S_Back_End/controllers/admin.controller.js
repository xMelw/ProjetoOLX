const model=require('../models/admin.model');
const userModel=require('../models/user.model');
const adsModel=require('../models/ads.model');
const catalogModel=require('../models/catalog.model');
const feedbackModel=require('../models/feedback.model');
const recentModel=require('../models/recent.model');
const stats=async(_req,res)=>res.json(await model.getDashboardStats());
const users=async(req,res)=>res.json(await userModel.listUsers(req.params.status));
async function user(req,res){const result=await userModel.findAdminDetails(req.params.id);return result?res.json(result):res.status(404).json({message:'Utilizador não encontrado.'});}
async function updateUserStatus(req,res){const status=req.body.estado;if(!['active','pending','banned'].includes(status))return res.status(400).json({message:'Estado inválido.'});await userModel.updateStatus(req.params.id,status);return res.json({ok:true});}
async function createUser(req,res){const name=(req.body.name||req.body.nome||'').trim();const email=String(req.body.email||'').trim().toLowerCase();const {password}=req.body;const status=req.body.status||'active';if(!name||!email||!password)return res.status(400).json({message:'Dados incompletos.'});if(!['active','pending','banned'].includes(status))return res.status(400).json({message:'Estado inválido.'});if(await userModel.emailExists(email))return res.status(409).json({message:'Este email já está registado.'});const result=await userModel.createAdminUser({name,email,password,status});return res.status(201).json({id:result.id,name,email,status});}
const adsByCategory=async(req,res)=>res.json(await catalogModel.countAdsByCategoryAndStatus(req.params.status));
const adsByStatus=async(_req,res)=>res.json(await catalogModel.countAdsByStatus());
async function updateAdStatus(req,res){const status=req.body.estado;if(!['active','pending','sold','removed'].includes(status))return res.status(400).json({message:'Estado inválido.'});await adsModel.updateAdminStatus(req.body.adId,status);return res.json({ok:true});}
const allAds=async(_req,res)=>res.json(await adsModel.listAdminAds());
const recent=async(req,res)=>res.json(await recentModel.listRecentViews(req.params.userId));
async function clearRecent(req,res){await recentModel.removeOlderThanDays(req.params.days);return res.json({ok:true});}
async function updateFeedbackStatus(req,res){if(!['active','pending','hidden'].includes(req.body.estado))return res.status(400).json({message:'Estado inválido.'});await feedbackModel.updateStatus(req.body.feedbackId,req.body.estado);return res.json({ok:true});}
const feedbackByStatus=async(req,res)=>res.json(await feedbackModel.listByStatus(req.params.status));
const feedbackTotals=async(_req,res)=>res.json(await feedbackModel.getTotalsByStatus());
module.exports={stats,users,user,updateUserStatus,createUser,adsByCategory,adsByStatus,updateAdStatus,allAds,recent,clearRecent,updateFeedbackStatus,feedbackByStatus,feedbackTotals};