//message.routes
const express= require('express');
const router=express.Router();
const verifyToken = require('../middlewares/verifyToken');
const messageController= require('../controllers/message.controller');

router.use(verifyToken);
router.post('/create',messageController.createMessage);
router.get('/get',messageController.getAllMessages);
router.get('/get/:id',messageController.getMessageById);
router.put('/update/:id',messageController.updateMessage);
router.delete('/delete/:id',messageController.deleteMessage);

module.exports=router;
