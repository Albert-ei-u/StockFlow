import axios from 'axios';
import { Product, Sale, Inventory, SalesSummary, TopProduct, DailySales } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product APIs
export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (product: Partial<Product>) => api.post<Product>('/products', product),
  update: (id: string, product: Partial<Product>) => api.put<Product>(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
  getLowStock: () => api.get<Product[]>('/products/low-stock'),
};

// Sale APIs
export const saleAPI = {
  getAll: () => api.get<Sale[]>('/sales'),
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (sale: Partial<Sale>) => api.post<Sale>('/sales', sale),
  updateStatus: (id: string, status: string) => api.patch<Sale>(`/sales/${id}/status`, { status }),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get<Sale[]>(`/sales/dates/${startDate}/${endDate}`),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: () => api.get<Inventory[]>('/inventory'),
  getById: (id: string) => api.get<Inventory>(`/inventory/${id}`),
  getLowStockAlerts: () => api.get<Inventory[]>('/inventory/low-stock'),
  getMovements: (id: string) => api.get(`/inventory/${id}/movements`),
  restock: (id: string, data: { quantity: number; notes?: string; supplier?: string }) =>
    api.post<Inventory>(`/inventory/${id}/restock`, data),
};

// Report APIs
export const reportAPI = {
  getSalesSummary: (startDate?: string, endDate?: string) =>
    api.get<SalesSummary>('/reports/sales-summary', { params: { startDate, endDate } }),
  getTopProducts: (limit?: number) =>
    api.get<TopProduct[]>('/reports/top-products', { params: { limit } }),
  getDailySales: (days?: number) =>
    api.get<DailySales[]>('/reports/daily-sales', { params: { days } }),
};

export default api;
