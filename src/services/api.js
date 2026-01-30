import axios from 'axios';
import logger from '../utils/logger';

// Flag de autenticação mock (sem backend/BD)
// Ative definindo VITE_MOCK_AUTH=true no ambiente (ex.: .env.local)
const MOCK_AUTH = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MOCK_AUTH === 'true';

// Lógica inteligente para definir a URL da API
// 1. Se estiver no domínio de produção, força o uso da API de produção (ignora .env local)
// 2. Se houver variável de ambiente VITE_API_URL, usa ela
// 3. Fallback para localhost ou produção baseado no hostname atual
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // Se estiver rodando no domínio de produção, use a API de produção
  if (hostname === 'progressoescolar.com.br' || hostname === 'www.progressoescolar.com.br') {
    return 'https://api.progressoescolar.com.br/api';
  }

  // Se houver env var definida (ex: build local), use-a, A MENOS que seja localhost e estejamos em outro domínio (caso raro)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback padrão
  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'http://localhost:5057/api'
    : 'https://api.progressoescolar.com.br/api';
};

const API_BASE_URL = getApiUrl();

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Remove /api from base url if present to get root
  const rootUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${rootUrl}${path}`;
};

logger.info('API Base URL configurada', { url: API_BASE_URL, hostname: window.location.hostname });

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
      // Em modo mock não limpamos o token nem redirecionamos
      if (!MOCK_AUTH) {
        logger.warn('Sessão expirada - Redirecionando para login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      } else {
        logger.warn('401 recebido em modo mock — ignorando logout automático');
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login
  login: async (email, password) => {
    // Modo mock: ignora chamada ao backend e autentica localmente
    if (MOCK_AUTH) {
      const mockUser = {
        id: 'mock-user-1',
        name: 'Usuário Demo',
        email,
        role: 'admin'
      };
      const mockToken = 'mock-token';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('tokenExpiresAt', expiresAt);

      logger.info('Login mock realizado (sem backend)');
      return { success: true, data: { token: mockToken, user: mockUser, expiresAt } };
    }

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
    // Modo mock: valida apenas dados locais
    if (MOCK_AUTH) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && utils.isTokenValid()) {
        return { success: true, data: { user } };
      }
      return { success: false, error: 'Não autenticado (mock)' };
    }

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
  },

  // Atualizar perfil e tema
  updateProfile: async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const config = isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};

      const response = await api.put('/auth/profile', data, config);
      // Atualizar user no localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar perfil'
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
