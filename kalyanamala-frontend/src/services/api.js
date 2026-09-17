import axios from 'axios';
import { API_BASE_URL, API_ORIGIN } from './apiBase';

export { API_BASE_URL, API_ORIGIN };

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateAccount: (data) => apiClient.put('/auth/account', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  adminResetPassword: (userId) => apiClient.post(`/admin/users/${userId}/reset-password`)
};

export const profileService = {
  createProfile: (data) => apiClient.post('/profiles', data),
  getMyProfile: () => apiClient.get('/profiles/me'),
  getProfile: (id) => apiClient.get(`/profiles/${id}`),
  updateProfile: (data) => apiClient.put('/profiles/me', data),
  searchProfiles: (filters) => apiClient.post('/profiles/search', filters),
};

export const connectionService = {
  sendRequest: (recipientId, message) =>
    apiClient.post(`/connections/send/${recipientId}`, { message }),
  acceptRequest: (connectionId) =>
    apiClient.put(`/connections/${connectionId}/accept`),
  getReceivedRequests: () => apiClient.get('/connections/received'),
  getAcceptedConnections: () => apiClient.get('/connections/accepted'),
};

export const messageService = {
  sendMessage: (recipientId, content) =>
    apiClient.post(`/messages/${recipientId}`, { content }),
  getMessages: (recipientId) => apiClient.get(`/messages/${recipientId}`),
  getConversations: () => apiClient.get('/messages/conversations/list'),
};

export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
  getUnreadCount: () => apiClient.get('/notifications/unread/count'),
};

export default apiClient;
