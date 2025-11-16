import api from './api.js';

const serviceService = {
  getAllServices: () => {
    return api.get('/services');
  },

  searchServices: (category, name) => {
    return api.get('/services/search', {
      params: { category, name }
    });
  },
  
  getServiceById: (id) => {
    return api.get(`/services/${id}`);
  },

  createService: (serviceData) => {
    return api.post('/services', serviceData);
  },

  updateService: (id, serviceData) => {
    return api.put(`/services/${id}`, serviceData);
  },

  deleteService: (id) => {
    return api.delete(`/services/${id}`);
  }
};

export default serviceService;