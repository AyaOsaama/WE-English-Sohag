import { api } from './api.js';
export const speakingApi = {
  challenges: () => api.get('/speaking/challenges'),
  submissions: (params = '') => api.get(`/speaking/submissions${params}`),
  submit: ({ challengeId, audioBlob, durationSeconds, transcript }) => {
    const form = new FormData();
    form.append('challengeId', challengeId);
    form.append('durationSeconds', String(durationSeconds));
    form.append('transcript', transcript || '');
    form.append('audio', audioBlob, 'speech.webm');
    return api.upload('/speaking/submissions', form);
  },
  audio: (id) => api.blob(`/speaking/submissions/${id}/audio`),
};
