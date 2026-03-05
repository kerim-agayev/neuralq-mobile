import { create } from 'zustand';
import { storage } from '../utils/storage';
import { User, AuthResponse } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (data: AuthResponse) => Promise<void>;
  loadAuth: () => Promise<boolean>;
  updateUser: (partial: Partial<User>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (data: AuthResponse) => {
    await storage.setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  loadAuth: async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) {
        set({ isLoading: false });
        return false;
      }
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      await storage.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  updateUser: (partial: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    }));
  },

  logout: async () => {
    await storage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
