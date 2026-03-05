export interface Language {
  value: string;
  label: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pl', label: 'Polski', flag: '🇵🇱' },
  { value: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'other', label: 'Other Language', flag: '🌐' },
];

/** The 16 languages that have verbal questions. 'other' falls back to 'en'. */
export const SUPPORTED_VERBAL_LANGS = LANGUAGES
  .filter((l) => l.value !== 'other')
  .map((l) => l.value);
