import { api } from './api.js';
export const authApi = {
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.patch('/users/me', payload),
};
