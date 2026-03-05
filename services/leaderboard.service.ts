import api from './api';
import { LeaderboardEntry } from '../types';

export interface UserRank {
  globalRank: number | null;
  countryRank: number | null;
  totalUsers: number;
  iqScore: number | null;
}

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

  getUserRank: async () => {
    const { data } = await api.get<{ success: boolean; data: UserRank }>(
      '/leaderboard/user/rank',
    );
    return data.data;
  },
};
