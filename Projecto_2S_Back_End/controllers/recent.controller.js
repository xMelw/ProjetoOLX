const model=require('../models/recent.model');
const add=async(req,res)=>{await model.addRecentView(Number(req.user.id),Number(req.body.anuncio_id));return res.status(201).json({ok:true});};
module.exports={add};