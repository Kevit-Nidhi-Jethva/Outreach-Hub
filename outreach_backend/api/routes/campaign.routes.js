const express= require('express');
const router=express.Router();
const verifyToken = require('../middlewares/verifyToken');
const campaignController= require('../controllers/campaign.controller');

router.use(verifyToken);

router.post('/create',campaignController.createCampaign);
router.get('/get',campaignController.getMyCampaign);
router.get('/get/all',campaignController.getAllCampaigns);
router.get('/get/:id',campaignController.getCampaignById);
router.put('/update/:id',campaignController.updateCampaignById);
router.delete('/delete/:id',campaignController.deleteCampaignById);

module.exports=router;