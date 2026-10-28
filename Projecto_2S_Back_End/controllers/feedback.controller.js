const model=require('../models/feedback.model');
async function average(req,res){const row=await model.getAverageForUser(req.params.id);return res.json({media:row.media||0,media_feedback:row.media||0,total:row.total});}
async function received(req,res){return res.json(await model.listReceived(req.query.utilizador_id));}
module.exports={average,received};