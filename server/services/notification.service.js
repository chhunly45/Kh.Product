const { User } = require('../models');

const addNotification = async (userId, notification) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const nextNotification = {
    type: notification.type || 'info',
    title: notification.title || 'Notification',
    message: notification.message || '',
    link: notification.link || null,
    read: false,
    createdAt: new Date()
  };

  user.notifications = user.notifications || [];
  user.notifications.unshift(nextNotification);
  if (user.notifications.length > 100) {
    user.notifications = user.notifications.slice(0, 100);
  }

  await user.save();
  return nextNotification;
};

const getNotifications = async (userId) => {
  const user = await User.findById(userId).select('notifications');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return (user.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getUnreadCount = async (userId) => {
  const user = await User.findById(userId).select('notifications');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return (user.notifications || []).filter((notification) => !notification.read).length;
};

const markAsRead = async (userId, notificationId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const notification = user.notifications.id(notificationId);
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  notification.read = true;
  await user.save();
  return notification;
};

module.exports = {
  addNotification,
  getNotifications,
  getUnreadCount,
  markAsRead
};
