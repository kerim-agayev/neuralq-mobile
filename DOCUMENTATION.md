# NeuralQ Mobile Application — Full Documentation

> **Platform**: React Native (Expo SDK 54)
> **Backend API**: `http://192.168.100.37:3000/api`
> **GitHub**: `https://github.com/kerim-agayev/neuralq-mobile.git`
> **i18n**: 16 dil + "Other Language" (toplam 17 secenek)
> **Tema**: Cyberpunk (dark neon) + Clean (light)

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Structure](#2-project-structure)
3. [App Bootstrap & Navigation](#3-app-bootstrap--navigation)
4. [Authentication (Login & Register)](#4-authentication-login--register)
5. [Home Screen](#5-home-screen)
6. [Test Engine (IQ Test)](#6-test-engine-iq-test)
7. [Result Screen](#7-result-screen)
8. [Leaderboard (Ranks)](#8-leaderboard-ranks)
9. [Profile Screen](#9-profile-screen)
10. [Daily Challenge](#10-daily-challenge)
11. [API Reference](#11-api-reference)
12. [State Management (Zustand Stores)](#12-state-management-zustand-stores)
13. [AsyncStorage Keys](#13-asyncstorage-keys)
14. [Theme System](#14-theme-system)
15. [i18n (Internationalization)](#15-i18n-internationalization)
16. [Constants](#16-constants)
17. [UI Components Library](#17-ui-components-library)

---

## 1. Tech Stack & Dependencies

| Paket | Versiyon | Amac |
|-------|---------|------|
| expo | ~54.0.0 | Framework |
| react | 19.1.0 | UI Library |
| react-native | 0.81.5 | Mobile runtime |
| expo-router | ~6.0.23 | File-based routing |
| zustand | ^5.0.5 | State management |
| axios | ^1.7.0 | HTTP client |
| i18next | ^24.2.3 | Internationalization |
| react-i18next | ^15.4.1 | React i18n bindings |
| @tanstack/react-query | ^5.72.2 | Data fetching |
| react-native-reanimated | ~3.17.4 | Animations |
| react-native-gesture-handler | ~2.24.0 | Gesture support |
| react-native-svg | 15.11.2 | SVG (SpiderChart) |
| react-native-toast-message | ^2.2.1 | Toast notifications |
| expo-haptics | ~14.1.4 | Haptic feedback |
| expo-image | ~2.3.0 | Image caching |
| expo-sharing | ~13.1.5 | Share functionality |
| expo-file-system | ~18.1.10 | File system (certificates) |
| @react-native-async-storage/async-storage | 2.1.2 | Local storage |
| react-native-safe-area-context | 5.4.0 | Safe area |

---

## 2. Project Structure

```
app/
  _layout.tsx          — Root layout (providers, i18n sync)
  index.tsx            — Splash screen (bootstrap + routing)
  (auth)/
    _layout.tsx        — Auth stack layout
    onboarding.tsx     — 3-slide onboarding + language selection
    login.tsx          — Email/password login
    register.tsx       — Registration form + country picker
  (tabs)/
    _layout.tsx        — Bottom tab bar (Home, Ranks, Profile)
    home.tsx           — Dashboard
    leaderboard.tsx    — Global/Country rankings
    profile.tsx        — User profile + settings
  test/
    _layout.tsx        — Test stack (tab bar hidden)
    select-mode.tsx    — Arcade vs Full Analysis selection
    session.tsx        — Active test session
    result.tsx         — Test results display
  daily/
    index.tsx          — Daily challenge flow
  history/
    [id].tsx           — Past test detail view

components/
  ui/                  — Reusable UI components (Button, Card, NeonText, etc.)
  home/                — Home screen components
  test/                — Test session components
  results/             — Result display components
  leaderboard/         — Leaderboard components
  profile/             — Profile components
  badges/              — Badge components
  onboarding/          — Onboarding components
  ErrorBoundary.tsx    — Error boundary wrapper

services/
  api.ts               — Axios instance + interceptors
  auth.service.ts      — Auth API calls
  test.service.ts      — Test API calls
  leaderboard.service.ts — Leaderboard API calls
  daily.service.ts     — Daily challenge API calls

store/
  auth.store.ts        — Authentication state
  settings.store.ts    — Theme + language preferences
  test.store.ts        — Active test session state

hooks/
  useAuth.ts           — Auth operations hook
  useTest.ts           — Test operations hook
  useTimer.ts          — Countdown timer hook
  useHaptic.ts         — Haptic feedback hook

types/
  api.ts               — API response wrapper type
  user.ts              — User, LoginInput, RegisterInput, AuthResponse
  question.ts          — QuestionCategory, TestMode, TestQuestion, QuestionOption
  result.ts            — TestResult, StartTestResponse, AnswerResponse, LeaderboardEntry
  daily.ts             — DailyChallenge, DailyAttemptResponse, DailyStats
  badge.ts             — Badge type
  index.ts             — Re-exports

constants/
  languages.ts         — 17 language definitions
  countries.ts         — 40 country definitions
  celebrities.ts       — 9 IQ-based celebrity matches

theme/
  colors.ts            — Cyberpunk + Clean color palettes
  index.ts             — useThemeColors() hook

i18n/
  index.ts             — i18next configuration
  locales/             — 16 JSON translation files

utils/
  storage.ts           — AsyncStorage wrapper
  shareResult.ts       — HTML share card generator
```

---

## 3. App Bootstrap & Navigation

### Splash Screen (`app/index.tsx`)

**Akis:**
1. Uygulama acilir → Splash ekrani gosterilir (NeuralQ logo + spinner)
2. Paralel olarak: minimum 1.5s bekleme + `loadAuth()` API cagrisi
3. Token varsa → `GET /api/auth/me` ile kullanici dogrulama
4. Routing karari:
   - Token gecerli → `/(tabs)/home`
   - Token yok, onboarding yapilmis → `/(auth)/login`
   - Token yok, onboarding yapilmamis → `/(auth)/onboarding`

**UI:**
- Siyah arka plan (cyberpunk) veya beyaz (clean)
- "NeuralQ" neon text (42px)
- Loading spinner

### Root Layout (`app/_layout.tsx`)

**Providers (dis → ic):**
1. `ErrorBoundary` — Crash guard
2. `GestureHandlerRootView` — Gesture support
3. `QueryClientProvider` — React Query (retry: 1, staleTime: 30s)
4. `Stack` — Expo Router navigation (headerShown: false, animation: fade)
5. `Toast` — Toast notification container

**Baslangic islemleri:**
1. `loadSettings()` → AsyncStorage'dan tema + dil yuklenir
2. i18n sync: settings store'daki `language` degistiginde `i18n.changeLanguage()` cagirilir
3. `"other"` → `"en"` UI fallback (Other Language secilmisse English UI gosterilir)

### Tab Navigation (`app/(tabs)/_layout.tsx`)

3 tab, emoji icon'lar ile:

| Tab | Emoji | Label | Ekran |
|-----|-------|-------|-------|
| Home | 🏠 | Home | `home.tsx` |
| Leaderboard | 🏆 | Ranks | `leaderboard.tsx` |
| Profile | 👤 | Profile | `profile.tsx` |

Tab bar: 64px yukseklik, tema renginde border

---

## 4. Authentication (Login & Register)

### Onboarding (`app/(auth)/onboarding.tsx`)

**3 Slide:**

| Slide | Emoji | Baslik | Aciklama |
|-------|-------|--------|----------|
| 1 | 🧠 | Discover Your IQ | Scientifically designed test |
| 2 | 🌍 | Compete Globally | Rank among millions worldwide |
| 3 | 🌐 | Choose Your Language | 4x4 dil secim gridi |

**LanguageSelector Component:**
- 4 sutunlu grid (responsive)
- 17 dil secenegi: en, tr, az, ru, zh, es, hi, ar, pt, fr, de, ja, ko, it, pl, id, other
- Her dil: bayrak emoji + kisa isim
- Secili dil: primary renk border + primaryDim arka plan

**Akis:**
1. 3 slide scroll edilir (horizontal FlatList)
2. Son slide'da dil secilir
3. "Get Started" butonu → `AsyncStorage.setItem('onboardingDone', 'true')` + login'e yonlendir

### Login (`app/(auth)/login.tsx`)

**Form Alanlari:**

| Alan | Tip | Placeholder | Validasyon |
|------|-----|-------------|------------|
| Email | TextInput (email-address) | email@example.com | Required, trim |
| Password | TextInput (secureTextEntry) | •••••••• | Required, trim |

**Ek UI Elemanlari:**
- Sifre goster/gizle toggle butonu (👁️ / 🙈)
- "Don't have an account? Sign Up" linki
- Hata mesaji kutusu (error state)

**API Cagrisi:**
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: true, data: { user: User, accessToken: string, refreshToken: string } }
```

**Basari sonrasi:**
1. `storage.setTokens(accessToken, refreshToken)` → AsyncStorage'a kaydet
2. `authStore.setAuth(data)` → Zustand store guncelle
3. `router.replace('/(tabs)/home')` → Home'a yonlendir

### Register (`app/(auth)/register.tsx`)

**Form Alanlari:**

| Alan | Tip | Zorunlu | Detay |
|------|-----|---------|-------|
| Username | TextInput | Evet | autoCapitalize: none |
| Email | TextInput (email-address) | Evet | autoCapitalize: none |
| Password | TextInput (secureTextEntry) | Evet | Min 6 karakter |
| Age | TextInput (number-pad) | Hayir | Max 3 haneli |
| Country | Country Picker Modal | Hayir | 40 ulke listesi |

**Country Picker Modal:**
- Tam ekran slide-up modal
- Arama input'u (ulke adi veya kodu ile filtre)
- FlatList ile ulke listesi
- Her ulke: bayrak + isim + kod (orn: 🇹🇷 Turkey TR)
- Secili ulke: primary renk border + primaryDim arka plan

**Form Validasyon:**
```typescript
const isFormValid = username.trim() && email.trim() && password.trim() && password.length >= 6;
```

**API Cagrisi:**
```
POST /api/auth/register
Body: {
  email: string,
  password: string,
  username: string,
  age?: number,
  country?: string,
  language?: string  // settings store'dan alinir
}
Response: { success: true, data: { user: User, accessToken: string, refreshToken: string } }
```

**Basari sonrasi:** Login ile ayni akis

---

## 5. Home Screen

### Ana Ekran (`app/(tabs)/home.tsx`)

**Sayfa acildiginda yapilan API cagrilari:**

```
Promise.allSettled([
  GET /api/tests/history      → Son test sonuclari + test sayisi
  GET /api/leaderboard/user/rank → Kullanicinin global/country rank'i
])
```

**State:**
- `lastResult: TestResult | null` — Son test sonucu
- `testsCount: number` — Toplam test sayisi
- `globalRank: number | null` — Global siralama
- `loading: boolean` — Ilk yukleme
- `refreshing: boolean` — Pull-to-refresh

**UI Bilesenleri (yukaridan asagiya):**

#### 1. Header
- "NeuralQ" neon text (26px)
- "Welcome back, {displayName}!" (textSecondary)

#### 2. StatsRow Component
5 kutu, yan yana (kucuk ekranlarda horizontal scroll):

| Emoji | Deger | Etiket |
|-------|-------|--------|
| 📝 | testsCompleted | Tests |
| 🔥 | currentStreak | Day Streak |
| 🧠 | brainPoints | BP |
| 🪙 | neuralCoins | Neural Coins |
| 🏆 | globalRank ?? "—" | Global Rank |

**Responsive davranis:**
- `width < 380px`: Horizontal ScrollView, her kutu 72px sabit genislik
- `width >= 380px`: Flex row, esit genislik

#### 3. QuickTestButton Component
- Pulsating animasyonlu daire buton
- "START IQ TEST" etiketi
- Tiklayinca: `/test/select-mode` sayfasina git

**Responsive boyutlar:**
```typescript
const btnSize = Math.min(screenWidth * 0.38, 160);
const glowSize = btnSize + 20;
```

#### 4. DailyChallengeCard Component
3 durumlu kart:

| Durum | Gosterilen |
|-------|------------|
| Loading | ActivityIndicator |
| Cevaplanmamis | "Solve Now" butonu + 🧩 emoji |
| Cevaplanmis | "Daily Complete!" + dogru/yanlis emoji + BP kazanimi |

**API Cagrisi:** `GET /api/daily/today`
**Tiklayinca:** `/daily` sayfasina git

#### 5. LastResultCard Component
- Son test sonucu yoksa: "No tests taken yet" + hint text
- Varsa: IQ skoru (buyuk font) + celebrity match + tarih + "View Details" linki

**Pull-to-Refresh:** Tum verileri tekrar ceker

**Incomplete Test Guard:**
- Uygulama acildiginda `storage.getTestBackup()` kontrol edilir
- 30 dakikadan eski backup → otomatik silinir
- Taze backup → Alert gosterir: "Incomplete Test — Discard"

---

## 6. Test Engine (IQ Test)

### Mode Selection (`app/test/select-mode.tsx`)

2 mod secenegi:

| Mod | Emoji | Aciklama |
|-----|-------|----------|
| ARCADE | 🎮 | Quick & fun brain challenge (15 soru) |
| FULL_ANALYSIS | 🧬 | Detailed cognitive breakdown (30+ soru) |

**Tiklayinca:**
1. `useTest().startTest(mode)` cagirilir
2. Arkaplanda: `settings.language` okunur, `"other"` → `"en"` fallback uygulanir
3. API cagrisi yapilir

**API Cagrisi:**
```
POST /api/tests/start
Body: { mode: "ARCADE" | "FULL_ANALYSIS", language: string }
Response: {
  success: true,
  data: {
    sessionId: string,
    mode: "ARCADE" | "FULL_ANALYSIS",
    verbalSkipped: boolean,      // Dil desteklenmiyorsa true
    totalTime: number,           // Toplam sure (saniye)
    questions: TestQuestion[]    // Soru listesi
  }
}
```

**TestQuestion Formati:**
```typescript
{
  id: string,
  category: "SPATIAL" | "LOGIC" | "VERBAL" | "MEMORY" | "SPEED",
  content: string,              // Soru metni
  imageUrl: string | null,      // Soru gorseli (Cloudinary URL)
  options: [
    { text: string, imageUrl?: string },  // 4-8 arasi secenek
    ...
  ],
  timeLimit: number             // Her sorunun kendi suresi (saniye)
}
```

### Test Session (`app/test/session.tsx`)

**Ekran Elemanlari (yukaridan asagiya):**

1. **ProgressIndicator**: "3/15" + kategori etiketi (SPATIAL, LOGIC, vb.)
2. **TimerBar**: Daralan sure cubugu (yesil → sari → kirmizi renk gecisi)
3. **StreakCounter**: Ust uste dogru sayisi (🔥 glow efekti)
4. **QuestionCard**: Soru metni + opsiyonel gorsel (`expo-image`)
5. **MixedOptions**: Secenek butonlari (metin ve/veya gorsel)
6. **AnswerFeedback**: Dogru (✓ yesil) / Yanlis (✗ kirmizi) overlay animasyonu

**Soru Cevaplama Akisi:**
1. Kullanici secenek tiklarsa veya sure dolarsa
2. Timer durdurulur
3. `submitAnswer()` API'ye gonderilir
4. Dogru/yanlis feedback gosterilir (800ms)
5. Haptic feedback (dogru: success, yanlis: error)
6. Sonraki soruya gecilir veya test bitirilir

**API Cagrisi (her soru icin):**
```
POST /api/tests/{sessionId}/answer
Body: {
  questionId: string,
  selectedAnswer: number | null,  // null = timeout
  responseTimeMs: number
}
Response: {
  success: true,
  data: {
    isCorrect: boolean,
    correctAnswer: number,      // Dogru secenek index'i
    explanation: string | null
  }
}
```

**Test Bitirme:**
```
POST /api/tests/{sessionId}/complete
Response: {
  success: true,
  data: TestResult  // Tam sonuc objesi
}
```

**Crash Recovery:**
- Her cevaptan sonra `storage.saveTestBackup()` cagirilir
- Backup icerigi: sessionId, mode, currentIndex, answeredCount, totalQuestions, timestamp
- App crash olursa, home ekraninda "Incomplete Test" alert gosterilir

**Back Button Guard:**
- Android back butonu → `confirmQuit()` Alert
- "Quit Test" → session resetlenir, home'a donulur

**Options Gosterim Formatlari:**

| Tur | Kosul | Gosterim |
|-----|-------|----------|
| TextOptions | Tum secenekler sadece text | Dikey buton listesi |
| ImageOptions | Tum secenekler imageUrl var | 2x2 veya 2x3 grid |
| MixedOptions | Karisik | Otomatik secim (text veya image) |

---

## 7. Result Screen

### Test Sonuc Ekrani (`app/test/result.tsx`)

**API Cagrisi:**
```
GET /api/tests/{sessionId}/result
Response: {
  success: true,
  data: TestResult
}
```

**TestResult Yapisi:**
```typescript
{
  id: string,
  iqScore: number,                    // 55-195 arasi
  zScore: number,
  rawScore: number,
  spatialScore: number | null,
  logicScore: number | null,
  verbalScore: number | null,         // null = verbal atlanmis
  memoryScore: number | null,         // null = MEMORY=0
  speedScore: number | null,
  spatialPercentile: number | null,   // 0-100
  logicPercentile: number | null,
  verbalPercentile: number | null,
  memoryPercentile: number | null,
  speedPercentile: number | null,
  cognitiveAge: number | null,
  celebrityMatch: string | null,
  countryRank: number | null,
  globalRank: number | null,
  certificateUrl: string | null,
  completedAt: string,                // ISO date
  newBadges?: string[]                // Yeni kazanilan badge key'leri
}
```

**Ekran Bilesenleri (yukaridan asagiya):**

#### 1. IQReveal Component
- Animasyonlu IQ skoru sayaci (0'dan hedefe dogru sayar)
- Daire icerisinde buyuk font
- Responsive: `circleSize = Math.min(screenWidth * 0.36, 160)`

#### 2. CelebrityMatch Component
- IQ araligi → unlu eslestirme (9 karakter)
- "You think like {celebrity}" kartinda gosterilir

| IQ Araligi | Karakter | Emoji |
|-----------|----------|-------|
| 55-75 | A Goldfish | 🐠 |
| 76-85 | Patrick Star | ⭐ |
| 86-95 | Homer Simpson | 🍩 |
| 96-105 | An Average Human | 🧑 |
| 106-115 | Hermione Granger | 📚 |
| 116-125 | Tony Stark | 🦾 |
| 126-139 | Sherlock Holmes | 🔍 |
| 140-159 | Rick Sanchez | 🧪 |
| 160-195 | Dr. Manhattan | 🔵 |

#### 3. SpiderChart Component (react-native-svg)
- Radar/spider chart, aktif kategoriler gosterilir
- Minimum 3 kategori gerekli (aksi halde fallback mesaji)
- Null/0 degerli kategoriler atlanir
- Atlanan kategori varsa altinda not: "X category not available for this test"
- Responsive: `size = Math.min(screenWidth * 0.56, 260)`

#### 4. CognitiveAge Component
- "Cognitive Age: {yas}" karti

#### 5. CategoryBreakdown Component
Aktif kategoriler renk kodlu bar ile, atlanan kategoriler "N/A" ile gosterilir:

**Aktif kategori satiri:**
- Emoji + Kategori adi + Yuzdelik (%) + Renk cubugu

**Renk kodlari:**
| Yuzdelik | Renk |
|---------|------|
| >= 75% | success (yesil) |
| >= 50% | primary (mavi/cyan) |
| >= 25% | warning (sari) |
| < 25% | error (kirmizi) |

**Atlanan kategoriler (dimmed, opacity: 0.5):**
- Verbal: `verbalSkipped=true` veya `verbalPercentile==null` → "N/A"
- Memory: `memoryPercentile==null/0` → "N/A" (MEMORY=0, DB'de soru yok)

#### 6. Rank Row
- Global Rank: 🌍 #{rank}
- Country Rank: 🏳️ #{rank}
- Sadece deger varsa gosterilir

#### 7. CertificateButton Component
- "Download Certificate" butonu
- Tiklaninca: PDF sertifika indirilir ve paylasim sheet acilir

**API Cagrisi:**
```
GET /api/results/{resultId}/certificate
Headers: { Authorization: Bearer <token> }
Response: PDF binary
```

**Islem:**
1. PDF indirilir → `expo-file-system` ile cache'e kaydedilir
2. `expo-sharing` ile paylasim sheet acilir

#### 8. ShareCard Component
- "Share Result" + "Take Another Test" butonlari

#### 9. BadgeUnlockModal
- Yeni kazanilan badge'ler varsa modal popup gosterilir
- Badge adi + congratulations animasyonu

---

## 8. Leaderboard (Ranks)

### Leaderboard Ekrani (`app/(tabs)/leaderboard.tsx`)

**Tab Switcher:**
| Tab | API | Aciklama |
|-----|-----|----------|
| Global | `GET /api/leaderboard/global` | Tum kullanicilar |
| Country | `GET /api/leaderboard/country/{code}` | Kullanicinin ulkesi |

**Country tab:** `user.country` kullanilir (language degil)

**API Response:**
```typescript
LeaderboardEntry[] = [
  {
    userId: string,
    username: string,
    displayName: string | null,
    iqScore: number,
    country: string | null,
    rank: number
  }
]
```

**LeaderboardCard Component:**
Her satir icin:

| Kolon | Icerik |
|-------|--------|
| Rank | Top 3: 🥇🥈🥉 emoji, digerleri: numara |
| Name | displayName \|\| username + "(You)" kendin icin |
| Country | ulke kodu (opsiyonel) |
| IQ Score | Buyuk font, primary renk, kendin icin neon glow |

**Kendi siran:** `primaryDim` arka plan + primary border ile vurgulanir

**Bos durum:** "No rankings yet" + 🏆 emoji

**Pull-to-refresh:** Desteklenir (RefreshControl)

---

## 9. Profile Screen

### Profile Ekrani (`app/(tabs)/profile.tsx`)

**Sayfa acildiginda yapilan API cagrilari:**
```
Promise.allSettled([
  GET /api/tests/history   → Test gecmisi
  GET /api/daily/stats     → Daily challenge istatistikleri
])
```

**Kullanici bilgileri:** `authStore.user` (zaten login'de yuklenmis)

**Ekran Bilesenleri (yukaridan asagiya):**

#### 1. ProfileHeader Component

**Avatar:**
- 80x80 daire, initials (ismin ilk 2 harfi)
- primaryDim arka plan, primary border

**Bilgi alanlari:**
- displayName || username (20px, bold)
- email (13px, secondary)

**Mini stat badge'leri:**
| Icerik | Kosul |
|--------|-------|
| 🌍 {country} | country varsa |
| 🎂 {age} | age varsa |

**BP / NC / Streak satiri:**
3 kutu yan yana:

| Emoji | Deger | Etiket |
|-------|-------|--------|
| 🧠 | brainPoints | BP |
| 🪙 | neuralCoins | NC |
| 🔥 | currentStreak | Streak |

**Edit Profile Butonu:**
- Tiklaninca slide-up modal acilir
- Duzenlenebilir alanlar:
  - Username (TextInput)
  - Country (country picker modal icinde)

**Profile Update API:**
```
PATCH /api/auth/me
Body: { username?: string, country?: string | null }
Response: { success: true, data: User }
```

#### 2. BadgesSection Component

**13 Badge (backend tarafindan tanimli):**

| Key | Kosul |
|-----|-------|
| first_test | Ilk test tamamla |
| test_5 | 5 test tamamla |
| test_25 | 25 test tamamla |
| iq_120 | IQ 120+ |
| iq_140 | IQ 140+ |
| iq_160 | IQ 160+ |
| streak_7 | 7 gun streak |
| streak_30 | 30 gun streak |
| logic_master | Logic percentile 90+ |
| spatial_master | Spatial percentile 90+ |
| speed_master | Speed percentile 90+ |
| top_100 | Global top 100 |
| country_1 | Ulke 1. sirada |

**Gosterim:**
- Responsive grid: 2 sutun (< 360px), 3 sutun (360-500px), 4 sutun (> 500px)
- Kazanilmis: renkli, emoji + tarih
- Kilitli: dimmed, 🔒 ikonu + "Locked" etiketi

**Veri kaynagi:** `user.badges[]` (auth store'dan)

#### 3. DailyStatsSection Component

**Gosterilen istatistikler:**

| Emoji | Etiket | Deger |
|-------|--------|-------|
| 🔥 | Day Streak | currentStreak days |
| 🏆 | Longest Streak | longestStreak days |
| 🎯 | Accuracy | accuracy% |
| 📊 | Attempts | totalAttempts |

**API:** `GET /api/daily/stats`
```typescript
DailyStats = {
  brainPoints: number,
  currentStreak: number,
  longestStreak: number,
  totalAttempts: number,
  correctAttempts: number,
  accuracy: number           // 0-100
}
```

#### 4. TestHistory Component

**Bos durum:** 🧠 + "No test history yet" + "Take your first IQ test to see results here"

**Dolu durum:** Her test icin kart:
- IQ skoru (buyuk font, primary renk)
- Celebrity match (emoji + isim)
- Tarih
- Tiklaninca: `/history/{id}` detay sayfasina git

#### 5. SettingsSection Component

**3 ayar satiri:**

| Emoji | Etiket | Aksiyon |
|-------|--------|---------|
| 🎨 Theme | Cyberpunk / Clean | Tikla → toggle |
| 🌐 Language | Bayrak + kod | Tikla → sonraki dile gec (cycle) |
| 🚪 Log Out | — | Tikla → onay Alert → logout |

**Theme Toggle:**
- `cyberpunk` ↔ `clean` arasinda gecis
- AsyncStorage + Zustand store guncellenir
- Aninda uygulanir (tum ekranlar `useThemeColors()` kullanir)

**Language Cycle:**
- 17 dil arasinda sirayla gecer
- `i18n.changeLanguage()` ile UI dili degisir
- `"other"` → English UI, ama backend'e `"other"` gonderilir
- Sonraki testte yeni dildeki verbal sorular gelir

**Logout:**
- Alert onay: "Are you sure you want to log out?"
- Onaylanirsa: `storage.clearTokens()` + store reset + login'e yonlendir

---

## 10. Daily Challenge

### Daily Challenge Ekrani (`app/daily/index.tsx`)

**5 State:**

| State | Durum | Gosterilen |
|-------|-------|------------|
| `loading` | Yukleniyor | ActivityIndicator |
| `question` | Soru gosteriliyor | Timer + soru + secenekler |
| `result` | Cevap verildi | Dogru/yanlis + puanlar |
| `already_done` | Bugun zaten cevaplanmis | Ozet + "Come back tomorrow" |
| `error` | Hata | "No challenge available today" |

**Akis:**
1. `GET /api/daily/today` → Soru verisi cekilir
2. `alreadyAttempted: true` → "already_done" state
3. `alreadyAttempted: false` → "question" state, timer baslar

**Soru Ekrani (question state):**
- Header: "Daily Brain Snatch" + geri butonu
- Tarih (orn: March 6, 2026)
- Community stats: "{N} players • {X}% correct"
- TimerBar + kalan sure
- QuestionCard + MixedOptions
- AnswerFeedback overlay

**Cevap Gonderme:**
```
POST /api/daily/today/attempt
Body: { selectedAnswer: number, responseTimeMs: number }
Response: {
  success: true,
  data: {
    isCorrect: boolean,
    correctAnswer: number,
    explanation: string | null,
    brainPointsEarned: number,     // Dogru: 15, Yanlis: 1
    neuralCoinsEarned: number,     // Dogru: 5+bonus, Yanlis: 1
    streakBonus: number,           // 7. gun: 20, 30. gun: 100
    streak: number,                // Guncel streak
    newBadges: string[]            // Yeni kazanilan badge'ler
  }
}
```

**Sonuc Ekrani (result state):**
- ✅ Correct! veya ❌ Incorrect
- 🧠 +{N} Brain Points
- 🪙 +{N} Neural Coins
- 🎁 +{N} NC streak bonus! (varsa)
- Explanation karti (varsa)
- Community stats
- 🔥 {N} day streak
- Badge unlock modal (yeni badge varsa)

**Zaten Cevaplanmis (already_done state):**
- ✅/❌ emoji
- "You already answered today!"
- Dogru/yanlis + BP kazanimi
- Community stats
- "Come back tomorrow for more"

---

## 11. API Reference

### Base Configuration
```typescript
const api = axios.create({
  baseURL: 'http://192.168.100.37:3000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

### Token Management
- Her istekte `Authorization: Bearer {token}` eklenir
- 401 hatasi → `POST /api/auth/refresh` ile token yenilenir → istek tekrar edilir
- Refresh basarisizsa → tokenlar silinir, login'e yonlendirilir

### Error Handling
| HTTP Kodu | Davranis |
|-----------|----------|
| No response | "Network Error" toast |
| 401 | Token refresh dene → basarisizsa logout |
| 429 | "Too many requests" toast |
| 500+ | "Server Error" toast |

### Tum Endpoint'ler

#### Auth
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | /auth/register | `{ email, password, username, age?, country?, language? }` | `{ user, accessToken, refreshToken }` |
| POST | /auth/login | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| GET | /auth/me | — | `User` |
| PATCH | /auth/me | `{ username?, country? }` | `User` |
| POST | /auth/refresh | `{ refreshToken }` | `{ accessToken, refreshToken }` |

#### Tests
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | /tests/start | `{ mode, language }` | `{ sessionId, mode, verbalSkipped, totalTime, questions[] }` |
| POST | /tests/{sessionId}/answer | `{ questionId, selectedAnswer, responseTimeMs }` | `{ isCorrect, correctAnswer, explanation }` |
| POST | /tests/{sessionId}/complete | — | `TestResult` |
| GET | /tests/{sessionId}/result | — | `TestResult` |
| GET | /tests/history | — | `TestResult[]` |

#### Results
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | /results/{resultId}/certificate | — | PDF binary |

#### Daily Challenge
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | /daily/today | — | `DailyChallenge` |
| POST | /daily/today/attempt | `{ selectedAnswer, responseTimeMs }` | `DailyAttemptResponse` |
| GET | /daily/stats | — | `DailyStats` |

#### Leaderboard
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | /leaderboard/global | — | `LeaderboardEntry[]` |
| GET | /leaderboard/country/{code} | — | `LeaderboardEntry[]` |
| GET | /leaderboard/user/rank | — | `{ globalRank, countryRank, totalUsers, iqScore }` |

---

## 12. State Management (Zustand Stores)

### auth.store.ts

| Field | Type | Aciklama |
|-------|------|----------|
| user | `User \| null` | Oturumdaki kullanici |
| isAuthenticated | `boolean` | Login durumu |
| isLoading | `boolean` | Auth yukleniyor |

| Action | Parametre | Aciklama |
|--------|-----------|----------|
| setAuth | AuthResponse | Token kaydet + user set et |
| loadAuth | — | AsyncStorage'dan token oku → /auth/me cagir |
| updateUser | Partial\<User\> | User objesini kismen guncelle |
| logout | — | Tokenlari sil + state resetle |

### settings.store.ts

| Field | Type | Default | Aciklama |
|-------|------|---------|----------|
| theme | `'cyberpunk' \| 'clean'` | `'cyberpunk'` | Aktif tema |
| language | `string` | `'en'` | Secili dil |
| isSettingsLoaded | `boolean` | `false` | Ayarlar yuklendi mi |

| Action | Parametre | Aciklama |
|--------|-----------|----------|
| loadSettings | — | AsyncStorage'dan oku |
| setTheme | ThemeName | Tema degistir + kaydet |
| setLanguage | string | Dil degistir + kaydet |

### test.store.ts

| Field | Type | Aciklama |
|-------|------|----------|
| sessionId | `string \| null` | Aktif test oturum ID |
| mode | `TestMode \| null` | ARCADE veya FULL_ANALYSIS |
| verbalSkipped | `boolean` | Verbal sorular atlanmis mi |
| totalTime | `number` | Toplam sure |
| questions | `TestQuestion[]` | Soru listesi |
| currentIndex | `number` | Suanki soru index'i |
| answers | `RecordedAnswer[]` | Verilen cevaplar |
| streak | `number` | Ust uste dogru sayisi |
| maxStreak | `number` | Maksimum streak |
| isActive | `boolean` | Test aktif mi |

| Action | Parametre | Aciklama |
|--------|-----------|----------|
| startSession | StartTestResponse | Yeni test oturumu baslatir |
| recordAnswer | questionId, selected, timeMs, result | Cevap kaydeder + streak gunceller |
| nextQuestion | — | Sonraki soruya gec |
| getCurrentQuestion | — | Suanki soru objesini don |
| isLastQuestion | — | Son soru mu kontrol et |
| resetSession | — | Oturumu sifirla + backup temizle |

---

## 13. AsyncStorage Keys

| Key | Deger | Aciklama |
|-----|-------|----------|
| `accessToken` | JWT string | API erisim tokeni |
| `refreshToken` | JWT string | Token yenileme tokeni |
| `onboardingDone` | `"true"` | Onboarding tamamlandi mi |
| `language` | orn: `"tr"`, `"en"`, `"other"` | Secili dil |
| `themePreference` | `"cyberpunk"` veya `"clean"` | Secili tema |
| `testBackup` | JSON string | Crash recovery icin test backup |

---

## 14. Theme System

### Cyberpunk Tema (Dark/Neon)
```
background: #0a0a0f (koyu siyah)
surface:    #12121a (koyu gri)
primary:    #00f5ff (cyan neon)
secondary:  #bf00ff (mor neon)
accent:     #ff006e (pembe neon)
success:    #39ff14 (yesil neon)
warning:    #ffb800 (sari)
error:      #ff073a (kirmizi neon)
text:       #e0e0ff (acik mavi-beyaz)
border:     #2a2a3e (koyu border)
```

### Clean Tema (Light)
```
background: #f8fafc (acik gri)
surface:    #ffffff (beyaz)
primary:    #3b82f6 (mavi)
secondary:  #8b5cf6 (mor)
accent:     #ec4899 (pembe)
success:    #22c55e (yesil)
warning:    #f59e0b (sari)
error:      #ef4444 (kirmizi)
text:       #0f172a (koyu lacivert)
border:     #e2e8f0 (acik border)
```

### Kullanim
```typescript
const colors = useThemeColors();
// colors.primary, colors.background, vb.
```

---

## 15. i18n (Internationalization)

### Desteklenen Diller (16 + Other)

| Kod | Dil | Bayrak |
|-----|-----|--------|
| en | English | 🇬🇧 |
| tr | Turkce | 🇹🇷 |
| az | Azerbaycanca | 🇦🇿 |
| ru | Rusca | 🇷🇺 |
| zh | Cince | 🇨🇳 |
| es | Ispanyolca | 🇪🇸 |
| hi | Hintce | 🇮🇳 |
| ar | Arapca | 🇸🇦 |
| pt | Portekizce | 🇧🇷 |
| fr | Fransizca | 🇫🇷 |
| de | Almanca | 🇩🇪 |
| ja | Japonca | 🇯🇵 |
| ko | Korece | 🇰🇷 |
| it | Italyanca | 🇮🇹 |
| pl | Lehce | 🇵🇱 |
| id | Endonezce | 🇮🇩 |
| other | Diger | 🌐 |

### Translation Key Namespace'leri

| Namespace | Ornek Key'ler |
|-----------|---------------|
| common | loading, error, retry, cancel, save, done, next, back, skip, ok, goBack, noData |
| auth | login, register, logout, email, password, username, age, country, selectCountry, searchCountry |
| onboarding | slide1Title, slide1Desc, slide2Title, slide2Desc, slide3Title, slide3Desc, getStarted |
| home | welcome, startTest, lastResult, noResults, streak, coins, firstTestHint |
| test | selectMode, arcade, arcadeDesc, fullAnalysis, preparingQuestions, question, timeUp, streak, quitTitle, quitMessage, networkError |
| result | yourIQ, celebrityMatch, cognitiveAge, categories, spatial, logic, verbal, memory, speed, notAvailable, globalRank, countryRank, share, retake, categoriesSkipped |
| leaderboard | title, global, country, rank, score, you, noRankings |
| profile | title, testHistory, settings, theme, cyberpunk, clean, language, noHistory, editProfile, brainPoints, neuralCoins, dailyStats, accuracy, longestStreak |
| badges | title, unlocked, locked, earned |
| daily | title, todayChallenge, alreadyDone, comeBackTomorrow, peopleAttempted, gotItRight, correct, incorrect, pointsEarned, coinsEarned, streakDays, solveNow, dailyComplete, noChallenge |
| history | notFound |

### "Other Language" Mantigi
- UI: `"other"` → `"en"` fallback (English UI gosterilir)
- Test: `"other"` → `"en"` language olarak backend'e gonderilir
- Backend: Eger dil desteklenmiyorsa `verbalSkipped: true` doner

---

## 16. Constants

### Countries (40 Ulke)
Register ve profile'da country picker icin kullanilir:
```typescript
{ code: "TR", name: "Turkey", flag: "🇹🇷" }
{ code: "US", name: "United States", flag: "🇺🇸" }
{ code: "GB", name: "United Kingdom", flag: "🇬🇧" }
// ... 37 ulke daha
```

### Celebrity Matches (9 Karakter)
IQ skoruna gore eslestirme:
```
55-75:   🐠 A Goldfish
76-85:   ⭐ Patrick Star
86-95:   🍩 Homer Simpson
96-105:  🧑 An Average Human
106-115: 📚 Hermione Granger
116-125: 🦾 Tony Stark
126-139: 🔍 Sherlock Holmes
140-159: 🧪 Rick Sanchez
160-195: 🔵 Dr. Manhattan
```

---

## 17. UI Components Library

### Button (`components/ui/Button.tsx`)
Neon glow buton, 3 boyut: sm, md, lg. Loading state destegi.

### Card (`components/ui/Card.tsx`)
Glassmorphism kart, 2 variant: default, elevated. Tema renkli border.

### NeonText (`components/ui/NeonText.tsx`)
Cyberpunk temada neon glow efektli baslik texti.

### LoadingSpinner (`components/ui/LoadingSpinner.tsx`)
Animasyonlu yukleme gostergesi, opsiyonel text. fullScreen ve size parametreleri.

### Skeleton (`components/ui/Skeleton.tsx`)
Shimmer efektli placeholder (loading state icin).

### HomeSkeleton / ProfileSkeleton
Sayfa bazinda skeleton layout'lari.

### QuestionCard (`components/test/QuestionCard.tsx`)
Soru metni + opsiyonel gorsel (expo-image, contentFit: contain).

### MixedOptions (`components/test/MixedOptions.tsx`)
Otomatik format secimi: sadece text → dikey butonlar, gorsel varsa → grid.

### TimerBar (`components/test/TimerBar.tsx`)
Daralan renk cubugu (yesil → sari → kirmizi). progress: 0-1 arasi.

### ProgressIndicator (`components/test/ProgressIndicator.tsx`)
"3/15 SPATIAL" formatinda soru sayaci.

### StreakCounter (`components/test/StreakCounter.tsx`)
🔥 + streak sayisi, glow efekti.

### AnswerFeedback (`components/test/AnswerFeedback.tsx`)
Dogru (✓) / Yanlis (✗) overlay animasyonu.

### BadgeUnlockModal (`components/badges/BadgeUnlockModal.tsx`)
Yeni badge kazanildiginda gosterilen modal popup.

---

*Bu dokumantasyon NeuralQ Mobile v1.0 icin olusturulmustur. Sprint 7 sonrasi guncel halidir.*
