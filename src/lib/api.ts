import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Services API

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/password', data),
};

// Services
export const servicesApi = {
  list: (params?: any) => api.get('/services', { params }),
  get: (id: number) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  publicList: (professionalId: number) =>
    api.get(`/public/professionals/${professionalId}/services`),
};

// Disponibilités
export const availabilityApi = {
  list: () => api.get('/availabilities'),
  update: (data: any) => api.put('/availabilities', data),
  exceptions: () => api.get('/availabilities/exceptions'),
  addException: (data: any) => api.post('/availabilities/exceptions', data),
  deleteException: (id: number) => api.delete(`/availabilities/exceptions/${id}`),
  getSlots: (params: any) => api.get('/public/availability/slots', { params }),
  getAvailableDays: (params: any) => api.get('/public/availability/days', { params }),
};

// Rendez-vous
export const appointmentsApi = {
  list: (params?: any) => api.get('/appointments', { params }),
  today: () => api.get('/appointments/today'),
  stats: () => api.get('/appointments/stats'),
  get: (id: number) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  publicCreate: (data: any) => api.post('/public/appointments', data),
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  confirm: (id: number) => api.post(`/appointments/${id}/confirm`),
  cancel: (id: number, reason?: string) =>
    api.post(`/appointments/${id}/cancel`, { reason }),
  complete: (id: number) => api.post(`/appointments/${id}/complete`),
  noShow: (id: number) => api.post(`/appointments/${id}/no-show`),
};

// Notifications
export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  stats: () => api.get('/notifications/stats'),
  get: (id: number) => api.get(`/notifications/${id}`),
  resend: (id: number) => api.post(`/notifications/${id}/resend`),
  cancel: (id: number) => api.post(`/notifications/${id}/cancel`),
};

// Dashboard
export const dashboardApi = {
  professional: () => api.get('/dashboard/professional'),
  client: () => api.get('/dashboard/client'),
  stats: (period?: string) => api.get('/dashboard/stats', { params: { period } }),
};

// Paramètres
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
  resetTemplates: () => api.post('/settings/reset-templates'),
  templateVariables: () => api.get('/settings/template-variables'),
};

// ============================================================================
// API Immobilier
// ============================================================================

// Vendeurs
export const sellersApi = {
  list: (params?: any) => api.get('/sellers', { params }),
  get: (id: number) => api.get(`/sellers/${id}`),
  create: (data: any) => api.post('/sellers', data),
  update: (id: number, data: any) => api.put(`/sellers/${id}`, data),
  delete: (id: number) => api.delete(`/sellers/${id}`),
  archive: (id: number) => api.post(`/sellers/${id}/archive`),
  stats: () => api.get('/sellers/stats'),
};

// Acheteurs
export const buyersApi = {
  list: (params?: any) => api.get('/buyers', { params }),
  get: (id: number) => api.get(`/buyers/${id}`),
  create: (data: any) => api.post('/buyers', data),
  update: (id: number, data: any) => api.put(`/buyers/${id}`, data),
  delete: (id: number) => api.delete(`/buyers/${id}`),
  archive: (id: number) => api.post(`/buyers/${id}/archive`),
  addCriteria: (id: number, data: any) => api.post(`/buyers/${id}/criteria`, data),
  updateCriteria: (buyerId: number, criteriaId: number, data: any) =>
    api.put(`/buyers/${buyerId}/criteria/${criteriaId}`, data),
  deleteCriteria: (buyerId: number, criteriaId: number) =>
    api.delete(`/buyers/${buyerId}/criteria/${criteriaId}`),
  stats: () => api.get('/buyers/stats'),
};

// Propriétés
export const propertiesApi = {
  list: (params?: any) => api.get('/properties', { params }),
  get: (id: number) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/properties', data),
  update: (id: number, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: number) => api.delete(`/properties/${id}`),
  findBuyers: (id: number) => api.get(`/properties/${id}/find-buyers`),
  markAsSold: (id: number) => api.post(`/properties/${id}/sold`),
  stats: () => api.get('/properties/stats'),
};

// Matches
export const matchesApi = {
  list: (params?: any) => api.get('/matches', { params }),
  get: (id: number) => api.get(`/matches/${id}`),
  pending: () => api.get('/matches/pending'),
  top: () => api.get('/matches/top'),
  updateStatus: (id: number, data: any) => api.put(`/matches/${id}/status`, data),
  recalculate: () => api.post('/matches/recalculate'),
  stats: () => api.get('/matches/stats'),
};

// Types de propriétés
export const propertyTypesApi = {
  list: () => api.get('/property-types'),
};
