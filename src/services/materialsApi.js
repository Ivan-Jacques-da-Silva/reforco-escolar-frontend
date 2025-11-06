import api from './api';

export const materialsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/materials', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/materials', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/materials/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
