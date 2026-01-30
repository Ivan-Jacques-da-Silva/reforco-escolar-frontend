import api from './api';

export const evaluationsApi = {
  // Listar avaliações (filtros opcionais)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/evaluations', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw error;
    }
  },

  // Criar avaliação
  create: async (data) => {
    try {
      const response = await api.post('/evaluations', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  },

  // Atualizar avaliação
  update: async (id, data) => {
    try {
      const response = await api.put(`/evaluations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  },

  // Excluir avaliação
  delete: async (id) => {
    try {
      await api.delete(`/evaluations/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      throw error;
    }
  }
};
