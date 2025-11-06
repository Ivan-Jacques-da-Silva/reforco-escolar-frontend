import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token expirou ou é inválido, limpar dados locais
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirecionar para login se não estiver na página de login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, expiresAt } = response.data;
      
      // Salvar dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokenExpiresAt', expiresAt);
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais independentemente do resultado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
    }
  },

  // Verificar se o usuário está autenticado
  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar autenticação'
      };
    }
  },

  // Registrar novo usuário (apenas admin)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar usuário'
      };
    }
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao alterar senha'
      };
    }
  }
};

// Serviços de alunos
export const studentsService = {
  // Listar alunos
  list: async (params = {}) => {
    try {
      const response = await api.get('/students', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar alunos'
      };
    }
  },

  // Buscar aluno por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar aluno'
      };
    }
  },

  // Criar aluno
  create: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar aluno'
      };
    }
  },

  // Atualizar aluno
  update: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar aluno'
      };
    }
  },

  // Deletar aluno
  delete: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar aluno'
      };
    }
  }
};

// Serviços de reforços
export const tutoringsService = {
  // Listar reforços
  list: async (params = {}) => {
    try {
      const response = await api.get('/tutorings', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar reforços'
      };
    }
  },

  // Buscar reforço por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/tutorings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar reforço'
      };
    }
  },

  // Criar reforço
  create: async (tutoringData) => {
    try {
      const response = await api.post('/tutorings', tutoringData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar reforço'
      };
    }
  },

  // Atualizar reforço
  update: async (id, tutoringData) => {
    try {
      const response = await api.put(`/tutorings/${id}`, tutoringData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar reforço'
      };
    }
  },

  // Deletar reforço
  delete: async (id) => {
    try {
      const response = await api.delete(`/tutorings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar reforço'
      };
    }
  },

  // Marcar como concluído
  complete: async (id, notes) => {
    try {
      const response = await api.patch(`/tutorings/${id}/complete`, { notes });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao concluir reforço'
      };
    }
  }
};

// Serviços de materiais
export const materialsService = {
  // Listar materiais
  list: async (params = {}) => {
    try {
      const response = await api.get('/materials', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar materiais'
      };
    }
  },

  // Buscar material por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar material'
      };
    }
  },

  // Criar material
  create: async (materialData) => {
    try {
      const response = await api.post('/materials', materialData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar material'
      };
    }
  },

  // Atualizar material
  update: async (id, materialData) => {
    try {
      const response = await api.put(`/materials/${id}`, materialData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar material'
      };
    }
  },

  // Deletar material
  delete: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar material'
      };
    }
  }
};

// Serviços de pagamentos
export const paymentsService = {
  // Listar pagamentos
  list: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar pagamentos'
      };
    }
  },

  // Buscar pagamento por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar pagamento'
      };
    }
  },

  // Criar pagamento
  create: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar pagamento'
      };
    }
  },

  // Atualizar pagamento
  update: async (id, paymentData) => {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar pagamento'
      };
    }
  },

  // Deletar pagamento
  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar pagamento'
      };
    }
  },

  // Marcar como pago
  markAsPaid: async (id, paymentMethod, notes) => {
    try {
      const response = await api.patch(`/payments/${id}/pay`, {
        paymentMethod,
        notes
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao marcar pagamento como pago'
      };
    }
  },

  // Relatório por período
  getReport: async (startDate, endDate, studentId) => {
    try {
      const params = { startDate, endDate };
      if (studentId) params.studentId = studentId;
      
      const response = await api.get('/payments/reports/period', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao gerar relatório'
      };
    }
  }
};

// Utilitários
export const utils = {
  // Verificar se o token está válido
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return new Date() < new Date(expiresAt);
  },

  // Obter dados do usuário do localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Limpar dados de autenticação
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiresAt');
  }
};

export default api;