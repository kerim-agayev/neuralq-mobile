import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ONBOARDING_DONE: 'onboardingDone',
  LANGUAGE: 'language',
  THEME: 'themePreference',
} as const;

export const storage = {
  // Token
  getAccessToken: () => AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
  setTokens: async (access: string, refresh: string) => {
    await AsyncStorage.multiSet([
      [KEYS.ACCESS_TOKEN, access],
      [KEYS.REFRESH_TOKEN, refresh],
    ]);
  },
  clearTokens: () =>
    AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN]),

  // Onboarding
  isOnboardingDone: async () => {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return val === 'true';
  },
  setOnboardingDone: () =>
    AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true'),

  // Language
  getLanguage: () => AsyncStorage.getItem(KEYS.LANGUAGE),
  setLanguage: (lang: string) =>
    AsyncStorage.setItem(KEYS.LANGUAGE, lang),

  // Theme
  getTheme: () => AsyncStorage.getItem(KEYS.THEME),
  setTheme: (theme: string) =>
    AsyncStorage.setItem(KEYS.THEME, theme),

  // Test session backup (crash recovery)
  saveTestBackup: async (backup: object) => {
    await AsyncStorage.setItem('testBackup', JSON.stringify(backup));
  },
  getTestBackup: async () => {
    const raw = await AsyncStorage.getItem('testBackup');
    return raw ? JSON.parse(raw) : null;
  },
  clearTestBackup: () => AsyncStorage.removeItem('testBackup'),
};
