const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', notificationController.getNotifications);
router.get('/count', notificationController.getNotificationCount);
router.patch('/:id/read', param('id').isMongoId().withMessage('Valid notification id is required'), validate, notificationController.markNotificationRead);

module.exports = router;
