import api from './api';

// Serviços para gerenciar alunos
export const studentsApi = {
  // Listar todos os alunos com paginação e filtros
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await api.get(`/students?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }
  },

  // Buscar aluno por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }
  },

  // Criar novo aluno
  create: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  // Atualizar aluno existente
  update: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  },

  // Deletar aluno
  delete: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error;
    }
  },

  // Buscar estatísticas dos alunos
  getStats: async () => {
    try {
      const response = await api.get('/students/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

export default studentsApi;