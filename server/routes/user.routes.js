const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/profile/:id', userController.getProfileById);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
