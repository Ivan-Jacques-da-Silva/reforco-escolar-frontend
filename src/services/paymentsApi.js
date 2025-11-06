import api from './api';

export const paymentsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/payments', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/payments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markAsPaid: async (id, paymentMethod, notes) => {
    try {
      const response = await api.patch(`/payments/${id}/pay`, {
        paymentMethod,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getReport: async (startDate, endDate, studentId) => {
    try {
      const params = { startDate, endDate };
      if (studentId) params.studentId = studentId;
      
      const response = await api.get('/payments/reports/period', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
