import api from './api';

export const tutoringsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/tutorings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/tutorings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/tutorings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/tutorings/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/tutorings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  complete: async (id, notes) => {
    try {
      const response = await api.patch(`/tutorings/${id}/complete`, { notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
