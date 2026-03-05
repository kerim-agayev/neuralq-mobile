import { cyberpunkColors, cleanColors, ThemeColors } from './colors';
import { useSettingsStore } from '../store/settings.store';

export function useThemeColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.theme);
  return theme === 'clean' ? cleanColors : cyberpunkColors;
}

export { cyberpunkColors, cleanColors };
export type { ThemeColors };
