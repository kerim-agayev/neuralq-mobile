import axios from 'axios';
import Toast from 'react-native-toast-message';
import { storage } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.37:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401 + error toasts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (no response — backend down or no internet)
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Check your connection and try again',
        visibilityTime: 3000,
      });
      return Promise.reject(error);
    }

    // 401 — try token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          await storage.clearTokens();
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newAccess = data.data.accessToken;
        const newRefresh = data.data.refreshToken;
        await storage.setTokens(newAccess, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        await storage.clearTokens();
        return Promise.reject(error);
      }
    }

    // 500 — server error
    if (error.response.status >= 500) {
      Toast.show({
        type: 'error',
        text1: 'Server Error',
        text2: 'Please try again later',
        visibilityTime: 3000,
      });
    }

    // 429 — rate limit
    if (error.response.status === 429) {
      Toast.show({
        type: 'error',
        text1: 'Too many requests',
        text2: 'Please wait a moment',
        visibilityTime: 3000,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
