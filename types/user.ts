export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  age: number | null;
  country: string | null;
  city: string | null;
  language: string;
  school: string | null;
  neuralCoins: number;
  brainPoints: number;
  currentStreak: number;
  longestStreak: number;
  themePreference: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  age?: number;
  country?: string;
  language?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
