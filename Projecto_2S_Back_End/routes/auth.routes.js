const router=require('express').Router();
const asyncRoute=require('../utils/asyncRoute');
const controller=require('../controllers/auth.controller');
router.post('/registro',asyncRoute(controller.register));router.post('/login',asyncRoute(controller.login));router.post('/logout',controller.logout);
module.exports=router;