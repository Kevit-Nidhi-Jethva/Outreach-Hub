const express= require('express');
const router= express.Router();
const verifyToken = require('../middlewares/verifyToken');
const contactController= require('../controllers/contact.controller');

router.use(verifyToken);

router.post('/create',contactController.createContact);
router.get('/get', contactController.getContacts);
router.get('/get/:id', contactController.getContactById);
router.put('/update/:id', contactController.updateContact);
router.delete('/delete/:id', contactController.deleteContact);

module.exports= router;