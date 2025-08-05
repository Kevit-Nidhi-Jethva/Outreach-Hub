const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/admin.controller');
const verifyToken = require('../middlewares/verifyToken');

// Protected route: Add user
router.post('/add-user', verifyToken, addUser);

module.exports = router;
