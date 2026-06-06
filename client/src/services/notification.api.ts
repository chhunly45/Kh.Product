import api from './api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.data;
};

export const getNotificationsCount = async () => {
  const response = await api.get('/notifications/count');
  return response.data.data?.count || 0;
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data.data;
};
