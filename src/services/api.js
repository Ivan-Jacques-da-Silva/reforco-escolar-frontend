import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : `${window.location.protocol}//${window.location.hostname}/api`;

logger.info('API Base URL configurada', { url: API_BASE_URL });

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    logger.apiRequest(config.method.toUpperCase(), config.url, config.data);
    
    return config;
  },
  (error) => {
    logger.error('Erro ao preparar requisição', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logger.apiResponse(
      response.config.method.toUpperCase(), 
      response.config.url, 
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      logger.apiError(error.config?.method?.toUpperCase(), error.config?.url, error);
    } else if (error.request) {
      logger.error('Erro de rede - Sem resposta do servidor', {
        endpoint: error.config?.url
      });
    } else {
      logger.error('Erro ao configurar requisição', { message: error.message });
    }

    if (error.response?.status === 401) {
      logger.warn('Sessão expirada - Redirecionando para login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
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