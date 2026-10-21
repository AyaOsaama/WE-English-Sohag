import { api } from './api.js';
export const courseApi = {
  list: () => api.get('/courses'),
  get: (id) => api.get(`/courses/${id}`),
  units: (id) => api.get(`/courses/${id}/units`),
  lesson: (id) => api.get(`/lessons/${id}`),
  completeLesson: (id, answers) => api.post(`/lessons/${id}/complete`, { answers }),
};
