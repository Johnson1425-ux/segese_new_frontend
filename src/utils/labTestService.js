import api from './api';

export const labTestService = {
  getAll: async () => {
    const response = await api.get('/lab-tests');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/lab-tests', data);
    return response.data;
  }
};