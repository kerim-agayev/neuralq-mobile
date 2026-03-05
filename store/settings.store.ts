import { create } from 'zustand';
import { storage } from '../utils/storage';

type ThemeName = 'cyberpunk' | 'clean';

interface SettingsState {
  theme: ThemeName;
  language: string;
  isSettingsLoaded: boolean;

  loadSettings: () => Promise<void>;
  setTheme: (theme: ThemeName) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'cyberpunk',
  language: 'en',
  isSettingsLoaded: false,

  loadSettings: async () => {
    const [savedTheme, savedLang] = await Promise.all([
      storage.getTheme(),
      storage.getLanguage(),
    ]);
    set({
      theme: (savedTheme as ThemeName) || 'cyberpunk',
      language: savedLang || 'en',
      isSettingsLoaded: true,
    });
  },

  setTheme: async (theme: ThemeName) => {
    await storage.setTheme(theme);
    set({ theme });
  },

  setLanguage: async (lang: string) => {
    await storage.setLanguage(lang);
    set({ language: lang });
  },
}));
