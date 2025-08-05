const express = require('express');
const router = express.Router();
const authcontroller = require('../controllers/auth.controller');
// POST /auth/login
router.post('/login', authcontroller.loginUser);
router.post('/signup', authcontroller.signupUser);
router.post('/adduser', authcontroller.addUser)
router.post('/logout',authcontroller.logoutUser)

module.exports = router;
