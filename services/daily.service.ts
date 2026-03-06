import api from './api';
import { DailyChallenge, DailyAttemptResponse, DailyStats } from '../types';

export const dailyService = {
  getToday: async (): Promise<DailyChallenge> => {
    const { data } = await api.get<{ success: boolean; data: DailyChallenge }>(
      '/daily/today',
    );
    return data.data;
  },

  submitAttempt: async (input: {
    selectedAnswer: number;
    responseTimeMs: number;
  }): Promise<DailyAttemptResponse> => {
    const { data } = await api.post<{ success: boolean; data: DailyAttemptResponse }>(
      '/daily/today/attempt',
      input,
    );
    return data.data;
  },

  getStats: async (): Promise<DailyStats> => {
    const { data } = await api.get<{ success: boolean; data: DailyStats }>(
      '/daily/stats',
    );
    return data.data;
  },
};
