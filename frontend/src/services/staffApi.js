import { api } from './api.js';
export const staffApi = {
  users: (q = '') => api.get(`/users${q}`),
  createUser: (payload) => api.post('/users', payload),
  updateUser: (id, payload) => api.patch(`/users/${id}`, payload),
  deactivateUser: (id) => api.delete(`/users/${id}`),
  studentProgress: (id) => api.get(`/users/${id}/progress`),
  announcements: () => api.get('/announcements'),
  createAnnouncement: (payload) => api.post('/announcements', payload),
  removeAnnouncement: (id) => api.delete(`/announcements/${id}`),
};
