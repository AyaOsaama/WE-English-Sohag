import { api } from './api.js';
export const dashboardApi = { get: () => api.get('/dashboard') };
