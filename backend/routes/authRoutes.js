const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.put('/profile/:id', authController.updateProfile);
router.post('/change-password/:id', authController.changePassword);

module.exports = router;
