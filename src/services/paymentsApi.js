import api from './api';

const MOCK = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MOCK_AUTH === 'true';
const KEY = 'mock_payments';

function readMock() {
  const seed = [
    { id: 'pay_1', studentId: 'stu_1', student: { name: 'Ana Souza' }, reference: 'Mensalidade 09/2025', amount: 149.9, status: 'PAID', paidAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'pay_2', studentId: 'stu_2', student: { name: 'Bruno Lima' }, reference: 'Mensalidade 09/2025', amount: 149.9, status: 'PENDING', createdAt: new Date().toISOString() },
  ];
  const s = localStorage.getItem(KEY);
  if (s) return JSON.parse(s);
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function writeMock(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const paymentsApi = {
  getAll: async (params = {}) => {
    try {
      if (MOCK) {
        let data = readMock();
        const { search = '', status = '', page = 1, limit = 10 } = params;
        if (search) {
          const q = search.toLowerCase();
          data = data.filter((p) => p.reference.toLowerCase().includes(q) || p.student?.name?.toLowerCase().includes(q));
        }
        if (status) data = data.filter((p) => p.status === status);
        const total = data.length;
        const start = (page - 1) * limit;
        const items = data.slice(start, start + limit);
        return { payments: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
      }
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
      if (MOCK) {
        const list = readMock();
        const item = { id: `pay_${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString(), ...data };
        list.unshift(item);
        writeMock(list);
        return { payment: item };
      }
      const response = await api.post('/payments', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((p) => p.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...data };
          writeMock(list);
          return { payment: list[idx] };
        }
        throw new Error('Pagamento não encontrado (mock)');
      }
      const response = await api.put(`/payments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      if (MOCK) {
        const list = readMock().filter((p) => p.id !== id);
        writeMock(list);
        return { success: true };
      }
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markAsPaid: async (id, paymentMethod, notes) => {
    try {
      if (MOCK) {
        const list = readMock();
        const idx = list.findIndex((p) => p.id === id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], status: 'PAID', paymentMethod, notes, paidAt: new Date().toISOString() };
          writeMock(list);
          return { payment: list[idx] };
        }
        throw new Error('Pagamento não encontrado (mock)');
      }
      const response = await api.patch(`/payments/${id}/pay`, { paymentMethod, notes });
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
