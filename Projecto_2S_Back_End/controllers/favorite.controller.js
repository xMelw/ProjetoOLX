const model=require('../models/favorites.model');
const currentUserId=(req)=>Number(req.user?.id);
async function list(req,res){if(currentUserId(req)!==Number(req.params.userId)&&req.user.role!=='admin')return res.status(403).json({message:'Sem autorização.'});return res.json(await model.listFavorites(req.params.userId));}
async function add(req,res){const userId=Number(req.body.utilizador_id||currentUserId(req));if(userId!==currentUserId(req))return res.status(403).json({message:'Sem autorização.'});await model.addFavorite(userId,Number(req.body.anuncio_id));return res.status(201).json({ok:true});}
async function remove(req,res){const userId=Number(req.body.utilizador_id||currentUserId(req));if(userId!==currentUserId(req))return res.status(403).json({message:'Sem autorização.'});await model.removeFavorite(userId,Number(req.body.anuncio_id));return res.json({ok:true});}
module.exports={list,add,remove};