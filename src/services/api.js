import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh token
      const user = auth.currentUser;
      if (user) {
        try {
          const newToken = await user.getIdToken(true);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch (refreshError) {
          // Redirect ke login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const deviceAPI = {
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  activate: (id) => api.post(`/devices/${id}/activate`),
  deactivate: (id) => api.post(`/devices/${id}/deactivate`),
  getHistory: (id) => api.get(`/devices/${id}/history`),
  sync: (id) => api.post(`/devices/${id}/sync`),
  invite: (email) => api.post('/devices/invite', { email }),
  getStats: () => api.get('/devices/stats'),
};

export const monitoringAPI = {
  getDeviceInfo: (id) => api.get(`/monitoring/${id}`),
  getLocation: (id) => api.get(`/monitoring/${id}/location`),
  getLocationHistory: (id) => api.get(`/monitoring/${id}/location-history`),
  getApplications: (id) => api.get(`/monitoring/${id}/applications`),
  getNetwork: (id) => api.get(`/monitoring/${id}/network`),
  getActivityLog: (id) => api.get(`/monitoring/${id}/activity-log`),
};

export const controlAPI = {
  screenshot: (id) => api.post(`/control/${id}/screenshot`),
  ring: (id) => api.post(`/control/${id}/ring`),
  lock: (id) => api.post(`/control/${id}/lock`),
  lostMode: (id) => api.post(`/control/${id}/lost-mode`),
  flashlight: (id, status) => api.post(`/control/${id}/flashlight`, { status }),
  vibrate: (id, duration) => api.post(`/control/${id}/vibrate`, { duration }),
  volume: (id, level) => api.post(`/control/${id}/volume`, { level }),
  sendNotification: (id, data) => api.post(`/control/${id}/notification`, data),
  sync: (id) => api.post(`/control/${id}/sync`),
  refresh: (id) => api.post(`/control/${id}/refresh`),
};

export default api;
