import api from './api';

const medicationService = {
  getAll: async () => {
    return api.get('/medications');
  },

  searchMedicines: (form, name) => {
    return api.get('/medications/search', {
      params: { name }
    });
  },

  getMedicineById: (id) => {
    return api.get(`medications/${id}`);
  },

  createMedicine: async (medicationData) => {
    return api.post('/medications', medicationData);
  },

  updateMedicine: async (id, medicationData) => {
    return api.put(`/medications/${id}`, medicationData);
  },

  deleteMedicine: async (id) => {
    return api.delete(`/medications/${id}`);
  }
};

export default medicationService;