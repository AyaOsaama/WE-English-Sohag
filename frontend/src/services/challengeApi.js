import { api } from './api.js';
export const challengeApi = {
  today: () => api.get('/challenges/today'),
  start: (id) => api.post(`/challenges/${id}/start`),
};
