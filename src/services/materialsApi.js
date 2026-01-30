import api from './api';

const MOCK = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOCK_AUTH === 'true';
const KEY = 'mock_materials';

function readMock() {
  const seed = [
    { id: 'mat_1', sku: 'MAT-001', name: 'Caderno 96 folhas', quantity: 40, minimum: 10, createdAt: new Date().toISOString() },
    { id: 'mat_2', sku: 'MAT-002', name: 'Lápis HB nº2', quantity: 120, minimum: 50, createdAt: new Date().toISOString() },
  ];
  const s = localStorage.getItem(KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function writeMock(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const materialsApi = {
  getAll: async (params = {}) => {
    try {
      if (MOCK) {
        let data = readMock();
        const { search = '', page = 1, limit = 10 } = params;
        if (search) {
          const q = search.toLowerCase();
          data = data.filter((m) => m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q));
        }
        const total = data.length;
        const start = (page - 1) * limit;
        const items = data.slice(start, start + limit);
        return { materials: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
      }
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
      if (MOCK) {
        const list = readMock();
        const item = { id: `mat_${Date.now()}`, ...data };
        list.unshift(item);
        writeMock(list);
        return { material: item };
      }
      const response = await api.post('/materials', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((m) => m.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...data };
          writeMock(list);
          return { material: list[idx] };
        }
        throw new Error('Material não encontrado (mock)');
      }
      const response = await api.put(`/materials/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      if (MOCK) {
        const list = readMock().filter((m) => m.id !== id);
        writeMock(list);
        return { success: true };
      }
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/materials/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
