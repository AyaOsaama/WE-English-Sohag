import { api } from './api.js';
export const aiApi = {
  chat: (payload) => api.post('/ai/chat', payload),
  conversations: () => api.get('/ai/conversations'),
  conversation: (id) => api.get(`/ai/conversations/${id}`),
  remove: (id) => api.delete(`/ai/conversations/${id}`),
};
