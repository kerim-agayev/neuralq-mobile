import api from './api';
import { ApiResponse, AuthResponse, LoginInput, RegisterInput, User } from '../types';

export const authService = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', input);
    return data.data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', input);
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  updateProfile: async (input: Partial<User>): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>('/auth/me', input);
    return data.data;
  },

  googleAuth: async (idToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/google', { idToken });
    return data.data;
  },
};
