import api from './api';

// Modo mock: usa localStorage e não chama backend
const MOCK = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOCK_AUTH === 'true';
const KEY = 'mock_students';

function readMock() {
  const seed = [
    { id: 'stu_1', name: 'Ana Souza', email: 'ana@example.com', phone: '(11) 99999-1111', grade: '7º Ano', status: 'ACTIVE', createdAt: new Date().toISOString() },
    { id: 'stu_2', name: 'Bruno Lima', email: 'bruno@example.com', phone: '(11) 98888-2222', grade: '8º Ano', status: 'ACTIVE', createdAt: new Date().toISOString() },
  ];
  const s = localStorage.getItem(KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function writeMock(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// Serviços para gerenciar alunos
export const studentsApi = {
  // Listar todos os alunos com paginação e filtros
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = params;
      const s = (search || '').trim();
      if (MOCK) {
        let data = readMock();
        if (s) {
          const q = s.toLowerCase();
          data = data.filter(
            (s) => s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
          );
        }
        if (status) {
          data = data.filter((s) => s.status === status);
        }
        const total = data.length;
        const start = (page - 1) * limit;
        const items = data.slice(start, start + limit);
        return { 
          students: items, 
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        };
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(s && { search: s }),
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
      if (MOCK) {
        const list = readMock();
        const item = { id: `stu_${Date.now()}`, status: 'ACTIVE', createdAt: new Date().toISOString(), ...studentData };
        list.unshift(item);
        writeMock(list);
        return { student: item };
      }

      const isFormData = studentData instanceof FormData;
      const config = isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : {};

      const response = await api.post('/students', studentData, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  // Atualizar aluno existente
  update: async (id, studentData) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((s) => s.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...studentData };
          writeMock(list);
          return { student: list[idx] };
        }
        throw new Error('Aluno não encontrado (mock)');
      }

      const isFormData = studentData instanceof FormData;
      // Ao enviar FormData, devemos deixar o Content-Type como undefined
      // para que o browser defina automaticamente o boundary
      const config = isFormData ? {
        headers: { 'Content-Type': undefined }
      } : {};

      const response = await api.put(`/students/${id}`, studentData, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  },

  // Deletar aluno
  delete: async (id) => {
    try {
      if (MOCK) {
        const list = readMock().filter((s) => s.id !== id);
        writeMock(list);
        return { success: true };
      }
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
