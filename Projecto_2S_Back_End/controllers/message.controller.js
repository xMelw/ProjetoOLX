const model=require('../models/messages.model');
const currentUserId=(req)=>Number(req.user?.id);
async function conversations(req,res,seller){const rows=await model.listConversations(currentUserId(req),seller);return res.json(rows.map(row=>({...row,imagem:row.imagem||null})));}
const sellerConversations=(req,res)=>conversations(req,res,true);
const buyerConversations=(req,res)=>conversations(req,res,false);
async function sellerChat(req,res){const ad=await model.getAdOwner(req.params.adId);if(!ad||ad.user_id!==currentUserId(req))return res.status(403).json({message:'Sem autorização.'});return res.json((await model.listChatMessages(req.params.adId,currentUserId(req),Number(req.params.otherId))).map(message=>({...message,imagem:message.imagem||null})));}
async function buyerChat(req,res){const ad=await model.getAdOwner(req.params.adId);if(!ad)return res.status(404).json({message:'Anúncio não encontrado.'});return res.json((await model.listChatMessages(req.params.adId,currentUserId(req),ad.user_id)).map(message=>({...message,imagem:message.imagem||null})));}
async function markRead(req,res){await model.markRead(Number(req.body.anuncio_id),currentUserId(req));return res.json({ok:true});}
async function send(req,res,recipient){const adId=Number(req.body.anuncio_id);const ad=await model.getAdOwner(adId);const body=req.body.mensagem?.trim();if(!ad||!body)return res.status(400).json({message:'Mensagem ou anúncio inválido.'});const sender=currentUserId(req);const target=recipient||ad.user_id;if(sender===target)return res.status(400).json({message:'Não pode enviar mensagem para si próprio.'});await model.createMessage(adId,sender,target,body);return res.status(201).json({ok:true});}
const sendToSeller=(req,res)=>send(req,res);
async function reply(req,res){const ad=await model.getAdOwner(req.body.anuncio_id);if(!ad||ad.user_id!==currentUserId(req))return res.status(403).json({message:'Sem autorização.'});return send(req,res,Number(req.body.utilizador_id));}
module.exports={sellerConversations,buyerConversations,sellerChat,buyerChat,markRead,sendToSeller,reply};