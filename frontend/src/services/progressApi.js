import { api } from './api.js';
export const progressApi = {
  overview: () => api.get('/progress'),
  skills: () => api.get('/progress/skills'),
  courses: () => api.get('/progress/courses'),
  badges: () => api.get('/badges'),
};
