const express = require('express');
const { body, param } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', chatController.listChats);
router.get('/:id', param('id').isMongoId(), validate, chatController.getChat);
router.post(
  '/',
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('message').optional().isString().trim(),
  validate,
  chatController.createChat
);
router.post('/:id/messages', param('id').isMongoId(), body('message').notEmpty().withMessage('Message text is required'), validate, chatController.sendMessage);
router.patch('/:id/read', param('id').isMongoId(), validate, chatController.markAsRead);

module.exports = router;
