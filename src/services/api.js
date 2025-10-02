import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Return error with more consistent format
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  addSearchHistory: (country) => api.post('/auth/search-history', { country }),
  requestVerification: () => api.post('/auth/request-verification'),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Countries API calls
export const countriesAPI = {
  search: (name) => api.get(`/countries/search/${encodeURIComponent(name)}`),
  getAll: () => api.get('/countries/all'),
  getByRegion: (region) => api.get(`/countries/region/${region}`),
  getByCode: (code) => api.get(`/countries/code/${code}`),
};

// Weather API calls
export const weatherAPI = {
  getCurrent: (city) => api.get(`/weather/current/${encodeURIComponent(city)}`),
  getForecast: (city) => api.get(`/weather/forecast/${encodeURIComponent(city)}`),
  getByCoordinates: (lat, lon) => api.get(`/weather/coordinates?lat=${lat}&lon=${lon}`),
};

// Images API calls
export const imagesAPI = {
  search: (query, page = 1, perPage = 12) => 
    api.get(`/images/search/${encodeURIComponent(query)}?page=${page}&per_page=${perPage}`),
  getCountryImages: (country, perPage = 8) => 
    api.get(`/images/country/${encodeURIComponent(country)}?per_page=${perPage}`),
  getRandom: (count = 1) => api.get(`/images/random?count=${count}`),
  trackDownload: (imageId) => api.post(`/images/download/${imageId}`),
};

// Places API calls
export const placesAPI = {
  search: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/places/search${queryString ? `?${queryString}` : ''}`);
  },
};

// Trips API calls
export const tripsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/trips${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/trips/${id}`),
  create: (tripData) => api.post('/trips', tripData),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  delete: (id) => api.delete(`/trips/${id}`),
  toggleFavorite: (id) => api.patch(`/trips/${id}/favorite`),
  getStats: () => api.get('/trips/stats/overview'),
  bulkDelete: (tripIds) => api.post('/trips/bulk-delete', { tripIds }),
  // Advanced search
  advancedSearch: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/trips/search${queryString ? `?${queryString}` : ''}`);
  },
  // Trip operations
  duplicate: (id) => api.post(`/trips/${id}/duplicate`),
  export: (id) => api.get(`/trips/${id}/export`, { responseType: 'blob' }),
  exportPdf: (id) => api.get(`/trips/${id}/export.pdf`, { responseType: 'blob' }),
  exportCsv: (id) => api.get(`/trips/${id}/export.csv`, { responseType: 'blob' }),
  exportXlsx: (id) => api.get(`/trips/${id}/export.xlsx`, { responseType: 'blob' }),
  // Itinerary
  addItinerary: (tripId, item) => api.post(`/trips/${tripId}/itinerary`, item),
  updateItinerary: (tripId, itemId, item) => api.put(`/trips/${tripId}/itinerary/${itemId}`, item),
  deleteItinerary: (tripId, itemId) => api.delete(`/trips/${tripId}/itinerary/${itemId}`),
  reorderItinerary: (tripId, order) => api.post(`/trips/${tripId}/itinerary/reorder`, { order }),
  duplicateDay: (tripId, fromDay, toDay) => api.post(`/trips/${tripId}/days/duplicate`, { fromDay, toDay }),
  deleteDay: (tripId, day, renumber = true) => api.post(`/trips/${tripId}/days/delete`, { day, renumber }),
  // Expenses
  getExpenses: (tripId) => api.get(`/trips/${tripId}/expenses`),
  addExpense: (tripId, expense) => api.post(`/trips/${tripId}/expenses`, expense),
  deleteExpense: (tripId, expenseId) => api.delete(`/trips/${tripId}/expenses/${expenseId}`),
  // Collaboration
  addComment: (tripId, content) => api.post(`/trips/${tripId}/comments`, { content }),
  deleteComment: (tripId, commentId) => api.delete(`/trips/${tripId}/comments/${commentId}`),
  uploadReceipts: (tripId, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post(`/trips/${tripId}/receipts`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  share: (tripId, email, role) => api.post(`/trips/${tripId}/share`, { email, role }),
  removeMember: (tripId, userId) => api.delete(`/trips/${tripId}/share/${userId}`),
  // Public sharing
  enablePublic: (tripId) => api.post(`/trips/${tripId}/public/enable`),
  disablePublic: (tripId) => api.post(`/trips/${tripId}/public/disable`),
};

// Users API calls
export const directionsAPI = {
  getRoute: (coords, profile = 'driving') => {
    // coords is array of {lat,lng} in correct order
    const path = coords.map(c => `${c.lng},${c.lat}`).join(';');
    return api.get(`/directions/route?coords=${encodeURIComponent(path)}&profile=${profile}`);
  },
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (payload) => api.patch('/users/me', payload),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Admin API calls
export const adminAPI = {
  listUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  listTrips: (page = 1, limit = 20) => api.get(`/admin/trips?page=${page}&limit=${limit}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
