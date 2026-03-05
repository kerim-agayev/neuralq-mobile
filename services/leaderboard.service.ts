import api from './api';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  getGlobal: async () => {
    const { data } = await api.get<{ success: boolean; data: LeaderboardEntry[] }>(
      '/leaderboard/global',
    );
    return data.data;
  },

  getCountry: async (countryCode: string) => {
    const { data } = await api.get<{ success: boolean; data: LeaderboardEntry[] }>(
      `/leaderboard/country/${countryCode}`,
    );
    return data.data;
  },
};
