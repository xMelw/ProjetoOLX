const catalogModel=require('../models/catalog.model');
const health=(_req,res)=>res.json({ok:true,service:'anuncios-tuga-api'});
const locations=async(_req,res)=>res.json(await catalogModel.listLocations());
const categories=async(_req,res)=>res.json(await catalogModel.listCategories());
module.exports={health,locations,categories};