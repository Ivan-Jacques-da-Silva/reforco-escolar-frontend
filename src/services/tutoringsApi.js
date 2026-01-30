import api from './api';

const MOCK = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOCK_AUTH === 'true';
const KEY = 'mock_tutorings';

function readMock() {
  const seed = [
    { id: 'tut_1', studentId: 'stu_1', student: { name: 'Ana Souza' }, subject: 'Matemática', topic: 'Equações 1º grau', plan: 'pacote', status: 'SCHEDULED', nextClass: new Date().toISOString() },
    { id: 'tut_2', studentId: 'stu_2', student: { name: 'Bruno Lima' }, subject: 'Português', topic: 'Interpretação', plan: 'avulsa', status: 'SCHEDULED', nextClass: new Date().toISOString() },
  ];
  const s = localStorage.getItem(KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function writeMock(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const tutoringsApi = {
  getAll: async (params = {}) => {
    try {
      if (MOCK) {
        let data = readMock();
        const { search = '', status = '', page = 1, limit = 10 } = params;
        if (search) {
          const q = search.toLowerCase();
          data = data.filter((t) => t.student?.name?.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
        }
        if (status) data = data.filter((t) => t.status === status);
        const total = data.length;
        const start = (page - 1) * limit;
        const items = data.slice(start, start + limit);
        return { tutorings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
      }
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
      if (MOCK) {
        const list = readMock();
        const item = { id: `tut_${Date.now()}`, status: 'SCHEDULED', ...data };
        list.unshift(item);
        writeMock(list);
        return { tutoring: item };
      }
      const response = await api.post('/tutorings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((t) => t.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...data };
          writeMock(list);
          return { tutoring: list[idx] };
        }
        throw new Error('Reforço não encontrado (mock)');
      }
      const response = await api.put(`/tutorings/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      if (MOCK) {
        const list = readMock().filter((t) => t.id !== id);
        writeMock(list);
        return { success: true };
      }
      const response = await api.delete(`/tutorings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  complete: async (id, notes) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((t) => t.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], status: 'COMPLETED', notes };
          writeMock(list);
          return { tutoring: list[idx] };
        }
        throw new Error('Reforço não encontrado (mock)');
      }
      const response = await api.patch(`/tutorings/${id}/complete`, { notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/tutorings/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
