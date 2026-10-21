import { api } from './api.js';
export const vocabularyApi = {
  queue: (limit = 20) => api.get(`/vocabulary/queue?limit=${limit}`),
  summary: () => api.get('/vocabulary/summary'),
  answer: (id, correct) => api.post(`/vocabulary/${id}/answer`, { correct }),
};
