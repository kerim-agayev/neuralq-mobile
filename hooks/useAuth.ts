import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../types';

export function useAuth() {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (input: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(input);
      await setAuth(data);
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Invalid email or password';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(input);
      await setAuth(data);
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.googleAuth(idToken);
      await setAuth(data);
      return true;
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Google sign-in failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, googleLogin, loading, error, clearError: () => setError(null) };
}
