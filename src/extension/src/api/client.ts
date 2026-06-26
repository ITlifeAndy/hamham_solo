import axios from 'axios';
import { storage } from '../services/storage';

export const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
export const DEFAULT_BASE_URL = 'http://localhost:5000';

export const resolveAvatarUrl = (url?: string, host?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${host || DEFAULT_BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.get('hamham_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const hostUrl = await storage.get('api_host_url');
  if (hostUrl) {
    // Ensure we append /api if it's just the host
    const baseUrl = hostUrl.endsWith('/api') ? hostUrl : `${hostUrl.replace(/\/$/, '')}/api`;
    config.baseURL = baseUrl;
  }

  return config;
});

export default api;
