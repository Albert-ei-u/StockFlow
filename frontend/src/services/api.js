import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  joinBusiness: (businessData) => api.post('/auth/join-business', businessData),
  getProfile: () => api.get('/auth/profile'),
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

// Sale APIs
export const saleAPI = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (sale) => api.post('/sales', sale),
  updateStatus: (id, status) => api.patch(`/sales/${id}/status`, { status }),
  getByDateRange: (startDate, endDate) => api.get(`/sales/dates/${startDate}/${endDate}`),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  restock: (id, data) => api.post(`/inventory/${id}/restock`, data),
  getLowStockAlerts: () => api.get('/inventory/low-stock'),
  getMovements: (productId) => api.get(`/inventory/movements/${productId}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getDailySales: (days = 7) => api.get(`/dashboard/daily-sales/${days}`),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getRecentSales: () => api.get('/dashboard/recent-sales'),
};

export default api;
