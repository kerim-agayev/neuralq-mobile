# SPRINT-4-STANDALONE-MOBILE.md — NeuralQ React Native (Standalone Repo)

> **DURUM**: Backend ve Admin panel monorepo'da çalışıyor (`iq_test/apps/api` ve `iq_test/apps/admin`). Mobil uygulama monorepo içinde Expo Router + Metro config sorunları nedeniyle 2 gündür çalıştırılamadı. **KARAR**: Mobil uygulama ayrı bir repo olarak oluşturulacak. Backend'e sadece HTTP API ile bağlanacak. Dosya veya paket paylaşımı yok.

---

## 📋 Backend API Referansı

Mobil uygulama bu API'ye bağlanacak. **Tüm endpoint'ler test edilmiş ve çalışır durumda.**

### Bağlantı Bilgileri

```
Base URL: http://192.168.100.37:3000/api
Port: 3000 (Backend API)
Port 3001 Admin panel içindir — mobil ASLA 3001'e bağlanmamalı!
```

### Auth Endpoint'leri

```
POST /api/auth/register
  Body: { email, password, username, age?, country?, language? }
  Response: { success: true, data: { user, accessToken, refreshToken } }

POST /api/auth/login
  Body: { email, password }
  Response: { success: true, data: { user, accessToken, refreshToken } }

POST /api/auth/refresh
  Body: { refreshToken }
  Response: { success: true, data: { accessToken, refreshToken } }

GET /api/auth/me
  Headers: Authorization: Bearer <accessToken>
  Response: { success: true, data: { id, email, username, displayName, age, country, language, role, neuralCoins, ... } }

PATCH /api/auth/me
  Headers: Authorization: Bearer <accessToken>
  Body: { displayName?, age?, country?, language?, themePreference? }
  Response: { success: true, data: { ...updatedUser } }
```

### Test Endpoint'leri

```
POST /api/tests/start
  Headers: Authorization: Bearer <accessToken>
  Body: { mode: "ARCADE" | "FULL_ANALYSIS", language?: "en" }
  Response: {
    success: true,
    data: {
      sessionId: "cuid_xxx",
      mode: "ARCADE",
      verbalSkipped: false,
      totalTime: 300,
      questions: [
        {
          id: "q_xxx",
          category: "LOGIC" | "SPATIAL" | "VERBAL" | "SPEED" | "MEMORY",
          content: "What comes next: 2, 4, 8, ?",
          imageUrl: null | "https://res.cloudinary.com/...",
          options: [
            { text: "12", imageUrl?: "https://..." },
            { text: "16" },
            { text: "14" },
            { text: "10" }
          ],
          timeLimit: 48
        }
      ]
    }
  }

POST /api/tests/:sessionId/answer
  Headers: Authorization: Bearer <accessToken>
  Body: {
    questionId: "q_xxx",
    selectedAnswer: 1,         // 0-7 arası index, null ise süre dolmuş
    responseTimeMs: 12450      // Client-side ölçülen süre (ms)
  }
  Response: { success: true, data: { isCorrect: true, correctAnswer: 1, explanation?: "..." } }

POST /api/tests/:sessionId/complete
  Headers: Authorization: Bearer <accessToken>
  Response: {
    success: true,
    data: {
      id: "result_xxx",
      iqScore: 127,
      zScore: 1.8,
      rawScore: 42.5,
      spatialScore: 85, logicScore: 92, verbalScore: 78, memoryScore: null, speedScore: 88,
      spatialPercentile: 80, logicPercentile: 95, verbalPercentile: 60, speedPercentile: 85,
      cognitiveAge: 22,
      celebrityMatch: "tony_stark",
      countryRank: 342,
      globalRank: 12450
    }
  }

GET /api/tests/history
  Headers: Authorization: Bearer <accessToken>
  Response: { success: true, data: [ ...pastResults ] }

GET /api/tests/:sessionId/result
  Headers: Authorization: Bearer <accessToken>
  Response: { success: true, data: { ...fullResult } }
```

### Leaderboard Endpoint'leri

```
GET /api/leaderboard/global
  Headers: Authorization: Bearer <accessToken>
  Response: { success: true, data: [ { userId, username, iqScore, country, rank } ] }

GET /api/leaderboard/country/:code
  Headers: Authorization: Bearer <accessToken>
  Response: { success: true, data: [ ... ] }
```

### Önemli Backend Bilgileri (Sprint 3.5-3.8 Değişiklikleri)

**1. Options formatı** — `options` artık object array:
```typescript
// HER ZAMAN bu formatı bekle:
type QuestionOption = { text: string; imageUrl?: string };
// Bir şık: sadece text, sadece image, veya ikisi birden olabilir
```

**2. Timer** — Her sorunun kendi `timeLimit`'i var (saniye). Sabit timer YOK.

**3. Universal dil sistemi** — SPATIAL/LOGIC/SPEED soruları `language: "universal"` ile etiketli, tüm dillerde gösterilir. VERBAL sorular dil-spesifik. Backend bunu otomatik yönetiyor — mobil sadece `language` parametresi gönderir.

**4. Şık sayısı** — 4 ile 8 arası. `correctAnswer` 0-7 arası olabilir.

**5. Celebrity Match sistemi:**
```typescript
const CELEBRITY_MATCHES = [
  { min: 55,  max: 75,  key: "goldfish",     label: "A Goldfish" },
  { min: 76,  max: 85,  key: "patrick_star",  label: "Patrick Star" },
  { min: 86,  max: 95,  key: "homer_simpson",  label: "Homer Simpson" },
  { min: 96,  max: 105, key: "average_joe",    label: "An Average Human" },
  { min: 106, max: 115, key: "hermione",       label: "Hermione Granger" },
  { min: 116, max: 125, key: "tony_stark",     label: "Tony Stark" },
  { min: 126, max: 139, key: "sherlock",       label: "Sherlock Holmes" },
  { min: 140, max: 159, key: "rick_sanchez",   label: "Rick Sanchez" },
  { min: 160, max: 195, key: "doc_manhattan",  label: "Dr. Manhattan" },
];
```

---

## ADIM 1: Proje Kurulumu (Expo SDK 54 — Standalone)

### 1.1 Yeni Repo Oluştur

```bash
# Masaüstünde veya istediğin yerde yeni klasör
mkdir neuralq-mobile
cd neuralq-mobile

# Git init
git init

# Expo 54 projesi oluştur
npx create-expo-app@latest . --template blank-typescript

# SDK'yı 54'e kilitle
npx expo install expo@~54.0.0
```

### 1.2 Bağımlılıkları Yükle

```bash
# 1. Expo Router + Navigation (HEPSİ npx expo install ile!)
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install react-native-safe-area-context react-native-screens
npx expo install react-native-web react-dom @expo/metro-runtime

# 2. Animasyon & Gesture
npx expo install react-native-reanimated react-native-gesture-handler

# 3. Expo modüller
npx expo install expo-splash-screen expo-font expo-haptics expo-localization
npx expo install expo-sharing expo-file-system expo-print
npx expo install expo-linear-gradient expo-image

# 4. Storage (Expo Go uyumlu!)
npx expo install @react-native-async-storage/async-storage

# 5. SVG
npx expo install react-native-svg

# 6. Pure JS paketler (npm ile)
npm install zustand @tanstack/react-query axios
npm install i18next react-i18next
npm install react-native-toast-message

# 7. Uyumluluk eşitle
npx expo install --fix

# 8. Kontrol
npx expo-doctor@latest
```

**YÜKLEME — bu paketler Expo Go'da çalışmaz:**
- ~~react-native-mmkv~~ → `@react-native-async-storage/async-storage`
- ~~react-native-svg-charts~~ → `react-native-svg` ile manual chart
- ~~lottie-react-native~~ → `react-native-reanimated` ile animasyon

### 1.3 package.json

```json
{
  "name": "neuralq-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "start:lan": "expo start --host lan",
    "start:clear": "expo start -c --host lan",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

**`"main": "expo-router/entry"` → ZORUNLU.**

### 1.4 app.json

```json
{
  "expo": {
    "name": "NeuralQ",
    "slug": "neuralq",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "neuralq",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0f"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0f"
      }
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.neuralq.app"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

**plugins: SADECE `"expo-router"` — başka plugin ekleme.**
**`newArchEnabled: true` sorun çıkarırsa `false` yap.**

### 1.5 babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

### 1.6 .env

```env
EXPO_PUBLIC_API_URL=http://192.168.100.37:3000
```

**Port 3000! (3001 değil — 3001 admin paneli)**

### 1.7 İlk Test — Minimum Dosyalar

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```typescript
// app/index.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeuralQ</Text>
      <Text style={styles.subtitle}>IQ Test App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#00f5ff', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#8888aa', fontSize: 16, marginTop: 8 },
});
```

### 1.8 Başlat ve Doğrula

```bash
npx expo start -c --host lan
# Telefondan QR tara → siyah ekranda cyan "NeuralQ" yazısı
# *** BUNU GÖRMEDEN SONRAKİ ADIMLARA GEÇME ***
```

---

## ADIM 2: Dosya Yapısı (Tam)

```
neuralq-mobile/
├── app/                               # Expo Router (file-based routing)
│   ├── _layout.tsx                    # Root: providers wrap (QueryProvider, ThemeProvider, etc.)
│   ├── index.tsx                      # Entry: splash → onboarding veya home
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx                # Auth stack layout
│   │   ├── onboarding.tsx             # 3 sayfalık tanıtım
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Bottom tab navigator (Home, Leaderboard, Profile)
│   │   ├── home.tsx
│   │   ├── leaderboard.tsx
│   │   └── profile.tsx
│   │
│   ├── test/
│   │   ├── _layout.tsx                # Test stack (tab bar gizli)
│   │   ├── select-mode.tsx            # Arcade vs Full seçimi
│   │   ├── session.tsx                # AKTİF TEST (soru kartları + timer)
│   │   └── result.tsx                 # Sonuç sayfası
│   │
│   └── history/
│       └── [id].tsx                   # Geçmiş test detayı
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx                 # Neon glow buton
│   │   ├── Card.tsx                   # Glassmorphism card
│   │   ├── GradientBackground.tsx
│   │   ├── NeonText.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingSlide.tsx
│   │   └── LanguageSelector.tsx       # 16 dil, bayraklı grid
│   │
│   ├── test/
│   │   ├── QuestionCard.tsx           # Ana soru kartı
│   │   ├── TextOptions.tsx            # Metin şıkları (dikey liste)
│   │   ├── ImageOptions.tsx           # Görsel şıkları (2x2/2x3 grid)
│   │   ├── MixedOptions.tsx           # Karma (text + thumbnail)
│   │   ├── TimerBar.tsx               # Daralan süre barı
│   │   ├── ProgressIndicator.tsx      # "3/15" soru sayacı
│   │   ├── StreakCounter.tsx           # "🔥 3 streak!"
│   │   ├── CategoryBadge.tsx
│   │   └── AnswerFeedback.tsx         # Doğru/yanlış animasyon
│   │
│   ├── results/
│   │   ├── IQReveal.tsx               # Sayı animasyonu (0 → 127)
│   │   ├── SpiderChart.tsx            # 5 kategori radar (react-native-svg)
│   │   ├── CelebrityMatch.tsx
│   │   ├── CognitiveAge.tsx
│   │   ├── CategoryBreakdown.tsx
│   │   └── ShareCard.tsx
│   │
│   ├── home/
│   │   ├── QuickTestButton.tsx
│   │   ├── LastResultCard.tsx
│   │   └── StatsRow.tsx
│   │
│   ├── leaderboard/
│   │   ├── LeaderboardList.tsx
│   │   └── LeaderboardCard.tsx
│   │
│   └── profile/
│       ├── ProfileHeader.tsx
│       ├── TestHistory.tsx
│       └── SettingsSection.tsx
│
├── services/
│   ├── api.ts                         # Axios instance + JWT interceptors
│   ├── auth.service.ts
│   ├── test.service.ts
│   ├── leaderboard.service.ts
│   └── user.service.ts
│
├── store/
│   ├── auth.store.ts                  # Zustand: user, tokens, isAuthenticated
│   ├── test.store.ts                  # Zustand: active test session state
│   └── settings.store.ts             # Zustand: theme, language
│
├── theme/
│   ├── colors.ts                      # Cyberpunk + Clean paleti
│   ├── typography.ts
│   └── index.ts                       # useTheme hook
│
├── i18n/
│   ├── index.ts                       # i18next config
│   └── locales/
│       ├── en.json
│       ├── tr.json
│       ├── az.json
│       ├── ru.json
│       └── ... (16 dil)
│
├── constants/
│   ├── celebrities.ts
│   ├── languages.ts                   # 16 dil listesi
│   └── api.ts                         # API_URL
│
├── hooks/
│   ├── useAuth.ts
│   ├── useTest.ts
│   ├── useTimer.ts
│   └── useHaptic.ts
│
├── types/
│   ├── api.ts                         # API response/request types
│   ├── question.ts
│   ├── user.ts
│   └── result.ts
│
├── utils/
│   ├── storage.ts                     # AsyncStorage wrapper
│   └── format.ts
│
├── assets/
│   ├── fonts/
│   │   ├── Orbitron-Bold.ttf
│   │   └── Orbitron-Regular.ttf
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
│
├── .env
├── .gitignore
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## ADIM 3: Core Altyapı

### 3.1 TypeScript Tipleri

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

// types/user.ts
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  age: number | null;
  country: string | null;
  language: string;
  neuralCoins: number;
  currentStreak: number;
  longestStreak: number;
  themePreference: string;
}

export interface LoginInput { email: string; password: string; }
export interface RegisterInput {
  email: string;
  password: string;
  username: string;
  age?: number;
  country?: string;
  language?: string;
}
export interface AuthResponse { user: User; accessToken: string; refreshToken: string; }

// types/question.ts
export interface QuestionOption {
  text: string;
  imageUrl?: string;
}

export type QuestionCategory = 'SPATIAL' | 'LOGIC' | 'VERBAL' | 'MEMORY' | 'SPEED';

export interface TestQuestion {
  id: string;
  category: QuestionCategory;
  content: string;
  imageUrl: string | null;
  options: QuestionOption[];  // 4-8 arası
  timeLimit: number;          // saniye
}

// types/result.ts
export interface TestResult {
  id: string;
  iqScore: number;
  zScore: number;
  rawScore: number;
  spatialScore: number | null;
  logicScore: number | null;
  verbalScore: number | null;
  memoryScore: number | null;
  speedScore: number | null;
  spatialPercentile: number | null;
  logicPercentile: number | null;
  verbalPercentile: number | null;
  memoryPercentile: number | null;
  speedPercentile: number | null;
  cognitiveAge: number | null;
  celebrityMatch: string | null;
  countryRank: number | null;
  globalRank: number | null;
}

export interface StartTestResponse {
  sessionId: string;
  mode: 'ARCADE' | 'FULL_ANALYSIS';
  verbalSkipped: boolean;
  totalTime: number;
  questions: TestQuestion[];
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string | null;
}
```

### 3.2 API Client

```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.37:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request: token ekle
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: 401 → refresh dene
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // login'e yönlendir (router.replace kullanılabilir)
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3.3 Auth Store (Zustand)

```typescript
// store/auth.store.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => Promise<void>;
  loadAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (data) => {
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return false;
    }
    try {
      const api = (await import('../services/api')).default;
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    set({ user: null, isAuthenticated: false });
  },
}));
```

### 3.4 Test Store (Zustand)

```typescript
// store/test.store.ts
import { create } from 'zustand';
import { TestQuestion, StartTestResponse, AnswerResponse } from '../types';

interface TestState {
  sessionId: string | null;
  mode: 'ARCADE' | 'FULL_ANALYSIS' | null;
  verbalSkipped: boolean;
  questions: TestQuestion[];
  currentIndex: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number | null;
    responseTimeMs: number;
    isCorrect: boolean | null;
  }>;
  streak: number;
  maxStreak: number;

  startSession: (data: StartTestResponse) => void;
  recordAnswer: (questionId: string, selected: number | null, timeMs: number, result: AnswerResponse) => void;
  nextQuestion: () => void;
  resetSession: () => void;
  getCurrentQuestion: () => TestQuestion | null;
}

export const useTestStore = create<TestState>((set, get) => ({
  sessionId: null,
  mode: null,
  verbalSkipped: false,
  questions: [],
  currentIndex: 0,
  answers: [],
  streak: 0,
  maxStreak: 0,

  startSession: (data) => set({
    sessionId: data.sessionId,
    mode: data.mode,
    verbalSkipped: data.verbalSkipped,
    questions: data.questions,
    currentIndex: 0,
    answers: [],
    streak: 0,
    maxStreak: 0,
  }),

  recordAnswer: (questionId, selected, timeMs, result) => set((state) => {
    const newStreak = result.isCorrect ? state.streak + 1 : 0;
    return {
      answers: [...state.answers, {
        questionId,
        selectedAnswer: selected,
        responseTimeMs: timeMs,
        isCorrect: result.isCorrect,
      }],
      streak: newStreak,
      maxStreak: Math.max(state.maxStreak, newStreak),
    };
  }),

  nextQuestion: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),

  resetSession: () => set({
    sessionId: null, mode: null, verbalSkipped: false,
    questions: [], currentIndex: 0, answers: [], streak: 0, maxStreak: 0,
  }),

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return currentIndex < questions.length ? questions[currentIndex] : null;
  },
}));
```

### 3.5 Theme

```typescript
// theme/colors.ts
export const cyberpunkColors = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceLight: '#1a1a2e',
  primary: '#00f5ff',
  primaryDim: '#00f5ff33',
  secondary: '#bf00ff',
  accent: '#ff006e',
  success: '#39ff14',
  warning: '#ffb800',
  error: '#ff073a',
  text: '#e0e0ff',
  textSecondary: '#8888aa',
  textDim: '#555577',
  border: '#2a2a3e',
  card: '#151520',
};

export const cleanColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceLight: '#f1f5f9',
  primary: '#3b82f6',
  primaryDim: '#3b82f622',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  text: '#0f172a',
  textSecondary: '#64748b',
  textDim: '#94a3b8',
  border: '#e2e8f0',
  card: '#ffffff',
};
```

### 3.6 Dil Listesi

```typescript
// constants/languages.ts
export const LANGUAGES = [
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
  { value: 'id', label: 'Indonesia', flag: '🇮🇩' },
] as const;
```

---

## ADIM 4: Auth Ekranları

### Splash → Routing

```typescript
// app/index.tsx
// 1. Splash screen göster
// 2. AsyncStorage'dan token kontrol et (useAuthStore.loadAuth)
// 3. Token valid → (tabs)/home
// 4. Token yok → onboarding tamamlanmış mı kontrol et
//    - İlk açılış → (auth)/onboarding
//    - Daha önce açılmış → (auth)/login
```

### Onboarding (3 slide, horizontal swipe)
- Slide 1: "Discover Your IQ" — beyin animasyonu (Reanimated ile)
- Slide 2: "Compete Globally" — dünya ikonu
- Slide 3: "Choose Your Language" — 4x4 bayraklı grid (LanguageSelector)
- Dil seçimi → AsyncStorage + i18n güncelle → "Get Started" → register

### Register
- Fields: username, email, password (show/hide), age, country dropdown, language (onboarding'den gelir)
- POST /api/auth/register → token AsyncStorage'a kaydet → (tabs)/home

### Login
- Fields: email, password
- POST /api/auth/login → token AsyncStorage'a kaydet → (tabs)/home

---

## ADIM 5: Navigation + Home

### Bottom Tabs (3 tab)
- Home (Brain icon)
- Leaderboard (Trophy icon)
- Profile (User icon)

### Home Ekranı
- Header: "NeuralQ" (Orbitron font)
- StatsRow: son IQ / streak / rank mini kartlar
- LastResultCard: son test sonucu (varsa)
- "START IQ TEST" büyük pulsating buton → test/select-mode
- Arcade (15Q, 5min) ve Full Analysis (50Q, 25min) mod kartları

---

## ADIM 6: Test Engine

### Akış
```
"Start" basılır → POST /api/tests/start → soruları store'a kaydet
→ test/session ekranına git → her soru için:
  1. QuestionCard göster (content + imageUrl + options)
  2. TimerBar başlat (question.timeLimit saniye)
  3. Options layout belirle:
     - Tüm şıklar text → TextOptions (dikey liste)
     - Tüm şıklar image → ImageOptions (2x2/2x3 grid)
     - Karma → MixedOptions
  4. Kullanıcı cevaplar veya süre dolar
  5. POST /api/tests/:sessionId/answer
  6. Doğru → yeşil + haptic + streak artır
     Yanlış → kırmızı shake + doğru şık highlight
  7. 1.5s bekle → nextQuestion
→ Son soru bitti → POST /api/tests/:sessionId/complete
→ test/result ekranına git
```

### TimerBar
- Renk geçişi: yeşil(100-60%) → sarı(60-30%) → turuncu(30-10%) → kırmızı pulse(10-0%)
- Her soru kendi timeLimit'ini kullanır
- Süre dolunca → selectedAnswer: null olarak submit

### Options Layout
```typescript
function getOptionsLayout(options: QuestionOption[]) {
  const allImages = options.every(o => o.imageUrl);
  const hasImages = options.some(o => o.imageUrl);
  if (allImages) return 'image-grid';
  if (hasImages) return 'mixed-grid';
  return 'text-list';
}
// 4 şık → 2x2, 6 şık → 2x3, 8 şık → 2x4 grid
```

---

## ADIM 7: Sonuç Ekranı

### Scroll view sırası:
1. **IQ Reveal** — 0'dan hedefe sayan animasyon (Reanimated timing), IQ'ya göre renk
2. **Celebrity Match** — flip card animasyon, "You're a Sherlock Holmes!"
3. **Spider Chart** — react-native-svg ile 5-köşe radar grafik (verbalSkipped → "N/A")
4. **Category Breakdown** — her kategori skor + percentile bar
5. **Cognitive Age** — "Beyin yaşın: 22"
6. **Rank** — ülke ve global sıralama
7. **Share** butonu + **Retake** butonu

---

## ADIM 8: Leaderboard + Profile

### Leaderboard
- 2 tab: Global / Country
- İlk 3: altın/gümüş/bronz
- Kullanıcının kendi sırası altta sabit

### Profile
- Profil bilgileri + quick stats
- Test geçmişi listesi
- Ayarlar: tema toggle, dil değiştirme, logout

---

## ADIM 9: i18n (16 Dil)

```typescript
// i18n/index.ts — cihaz dilini algıla, AsyncStorage'dan kaydedilmişi yükle
// Tüm UI metinleri (butonlar, başlıklar, sonuçlar) 16 dilde
// Soru içerikleri backend'den geliyor — i18n sadece UI için
// const languages = ['en', 'tr', 'az', 'ru', 'zh', 'es', 'hi', 'ar', 'pt', 'fr', 'de', 'ja', 'ko', 'it', 'pl', 'id'];
```

---

## BİTİRME KONTROL LİSTESİ

```
✅ PROJE
  ✅ Standalone repo (monorepo değil!)
  ✅ Expo SDK 54
  ✅ npx expo start -c --host lan → telefonda çalışıyor
  ✅ .env: EXPO_PUBLIC_API_URL=http://192.168.100.37:3000 (PORT 3000!)

✅ AUTH
  ✅ Onboarding 3 slide + dil seçimi
  ✅ Register → POST /api/auth/register → token kaydediliyor
  ✅ Login → POST /api/auth/login → token kaydediliyor
  ✅ Auto-login: AsyncStorage'da token varsa direkt home
  ✅ Token refresh interceptor çalışıyor

✅ TEST ENGINE
  ✅ POST /api/tests/start → soruları çekiyor
  ✅ Options: text-list, image-grid, mixed-grid otomatik layout
  ✅ 4-8 arası şık destekleniyor
  ✅ Her sorunun kendi timeLimit'i ile timer çalışıyor
  ✅ Cevap sonrası POST /api/tests/:id/answer
  ✅ Doğru/yanlış animasyonlar + haptic
  ✅ Streak counter
  ✅ Son soru → POST /api/tests/:id/complete

✅ SONUÇ
  ✅ IQ reveal animasyonu
  ✅ Spider chart (5 kategori)
  ✅ Celebrity match
  ✅ Cognitive age
  ✅ Ülke + global rank
  ✅ Share butonu

✅ LEADERBOARD + PROFILE
  ✅ Global / country sıralama
  ✅ Test geçmişi
  ✅ Tema toggle + dil değiştirme + logout

✅ i18n — 16 dil UI çevirisi
```
