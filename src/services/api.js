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
};

export default api;