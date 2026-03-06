# SPRINT-6-MOBILE.md — Daily Challenge, Badges, Profile Upgrade & Store Hazırlık

> **TAMAMLANAN**: Mobil 9 adım + Sprint 5 (entegrasyon, error handling, share, certificate, polish, icon)
>
> **BU SPRINT**: Daily Challenge UI, badge gösterimi, profil yükseltme, Neural Coins görünümü, store hazırlık
>
> **REPO**: `neuralq-mobile/` (standalone)
> **Backend API**: `http://192.168.100.37:3000/api` (Port 3000!)
>
> **ÖN KOŞUL**: Sprint 6 Backend-Admin tamamlanmış olmalı (Daily Challenge API, Badge API, NC sistemi)

---

## Yeni Backend Endpoint'leri (Sprint 6'da eklenen)

```
GET  /api/daily/today          → Günün sorusu + kullanıcı cevapladı mı
POST /api/daily/today/attempt  → Daily cevap gönder
GET  /api/daily/stats          → Streak, accuracy, brain points
GET  /api/auth/me              → Artık badges[] ve neuralCoins dahil
```

**Daily today response:**
```typescript
{
  success: true,
  data: {
    id: "challenge_xxx",
    date: "2026-03-06",
    question: {
      id: "q_xxx",
      category: "LOGIC",
      content: "What comes next: 2, 6, 18, 54, ?",
      imageUrl: null,
      options: [{ text: "108" }, { text: "162" }, { text: "72" }, { text: "216" }],
      timeLimit: 48,
      difficultyLevel: 5
    },
    totalAttempts: 342,
    correctAttempts: 198,
    alreadyAttempted: false,
    userAnswer: null  // veya { selectedAnswer: 1, isCorrect: true, brainPointsEarned: 15 }
  }
}
```

**Daily attempt response:**
```typescript
{
  success: true,
  data: {
    isCorrect: true,
    correctAnswer: 1,
    explanation: "Each number × 3: 54 × 3 = 162",
    brainPointsEarned: 15,
    neuralCoinsEarned: 5,
    streak: 4,
    newBadges: ["streak_7"]  // boş array olabilir
  }
}
```

---

## Kapsam — 7 Adım

| Adım | İçerik |
|------|--------|
| 1 | Types + services + store güncellemeleri |
| 2 | Daily Challenge ekranı |
| 3 | Badge sistemi (profilde gösterim + kazanım bildirimi) |
| 4 | Profile upgrade (badges, brain points, NC) |
| 5 | Home ekranı güncelleme (daily card, badges hint) |
| 6 | i18n güncellemeleri (16 dil) |
| 7 | Store hazırlık (EAS Build config, app.json finalize) |

---

## ADIM 1: Types, Services, Store

### 1.1 Yeni Tipler

```typescript
// types/daily.ts
export interface DailyChallenge {
  id: string;
  date: string;
  question: {
    id: string;
    category: string;
    content: string;
    imageUrl: string | null;
    options: Array<{ text: string; imageUrl?: string }>;
    timeLimit: number;
    difficultyLevel: number;
  };
  totalAttempts: number;
  correctAttempts: number;
  alreadyAttempted: boolean;
  userAnswer: {
    selectedAnswer: number;
    isCorrect: boolean;
    brainPointsEarned: number;
  } | null;
}

export interface DailyAttemptResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string | null;
  brainPointsEarned: number;
  neuralCoinsEarned: number;
  streak: number;
  newBadges: string[];
}

export interface DailyStats {
  brainPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

// types/badge.ts
export interface Badge {
  id: string;
  name: string;  // "first_test", "iq_120", "streak_7"
  awardedAt: string;
}
```

### 1.2 Daily Service

```typescript
// services/daily.service.ts
import api from './api';

export const dailyService = {
  getToday: async () => {
    const { data } = await api.get('/daily/today');
    return data.data;
  },

  submitAttempt: async (input: { selectedAnswer: number; responseTimeMs: number }) => {
    const { data } = await api.post('/daily/today/attempt', input);
    return data.data;
  },

  getStats: async () => {
    const { data } = await api.get('/daily/stats');
    return data.data;
  },
};
```

### 1.3 User Type Güncelleme

```typescript
// types/user.ts — User interface'e ekle:
export interface User {
  // ...mevcut alanlar
  neuralCoins: number;
  brainPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}
```

---

## ADIM 2: Daily Challenge Ekranı

### 2.1 Route

```typescript
// app/(tabs)/home.tsx'den erişim VEYA ayrı sayfa:
// app/daily/index.tsx — Daily challenge ekranı
```

### 2.2 Ekran Tasarımı

```
┌────────────────────────────────┐
│  ← Back          Daily Brain   │
├────────────────────────────────┤
│                                │
│  🧠 Daily Brain Snatch        │
│  March 6, 2026                 │
│                                │
│  342 people attempted today    │
│  58% got it right              │
│                                │
├────────────────────────────────┤
│                                │
│  [QuestionCard component]      │  ← Aynı test engine component'ı
│  [TimerBar]                    │
│  [Options]                     │
│                                │
├────────────────────────────────┤
│  🔥 Streak: 4 days            │
│  🧠 Brain Points: 156         │
└────────────────────────────────┘

// Cevapladıktan sonra:
┌────────────────────────────────┐
│  ✅ Correct! +15 BP, +5 NC    │  ← veya ❌ Wrong! +2 BP, +1 NC
│                                │
│  Explanation: Each × 3...      │
│                                │
│  📊 58% of players got this    │
│  🔥 Your streak: 5 days!      │
│                                │
│  [Back to Home]                │
└────────────────────────────────┘

// Zaten cevaplamışsa:
┌────────────────────────────────┐
│  You already answered today!   │
│  ✅ Your answer was correct    │
│  Come back tomorrow for more   │
│  🔥 Streak: 5 days            │
└────────────────────────────────┘
```

### 2.3 Implementasyon

```typescript
// app/daily/index.tsx

// 1. useQuery ile GET /api/daily/today çağır
// 2. alreadyAttempted === true → "Already done" ekranı
// 3. alreadyAttempted === false → soru kartı göster
// 4. Cevap seçilince POST /api/daily/today/attempt
// 5. Sonuç göster (doğru/yanlış + BP + NC + streak)
// 6. newBadges varsa → badge kazanım bildirimi göster

// QuestionCard, TextOptions/ImageOptions, TimerBar component'larını
// test engine'dan REUSE et — aynı component'lar
```

---

## ADIM 3: Badge Sistemi

### 3.1 Badge Tanımları (Client-side)

```typescript
// constants/badges.ts
export const BADGE_INFO: Record<string, { emoji: string; title: string; description: string }> = {
  first_test:    { emoji: '🎯', title: 'First Steps',     description: 'Completed first IQ test' },
  test_5:        { emoji: '🔬', title: 'Brain Warming Up', description: 'Completed 5 tests' },
  test_25:       { emoji: '🏆', title: 'Test Master',      description: 'Completed 25 tests' },
  iq_120:        { emoji: '💡', title: 'Sharp Mind',        description: 'Scored IQ 120+' },
  iq_140:        { emoji: '🧬', title: 'Genius',            description: 'Scored IQ 140+' },
  iq_160:        { emoji: '⚡', title: 'Transcendent',      description: 'Scored IQ 160+' },
  streak_7:      { emoji: '🔥', title: 'Weekly Brain',      description: '7-day daily streak' },
  streak_30:     { emoji: '💎', title: 'Monthly Brain',     description: '30-day daily streak' },
  logic_master:  { emoji: '🧮', title: 'Logic Master',      description: '90+ in Logic' },
  spatial_master:{ emoji: '🎨', title: 'Spatial Master',    description: '90+ in Spatial' },
  speed_master:  { emoji: '⚡', title: 'Speed Demon',       description: '90+ in Speed' },
  top_100:       { emoji: '🌍', title: 'Elite 100',         description: 'Global top 100' },
  country_1:     { emoji: '🏅', title: 'National Champion', description: '#1 in country' },
};
```

### 3.2 Badge Kazanım Bildirimi

```typescript
// components/badges/BadgeUnlockModal.tsx

// Test veya daily attempt sonucu newBadges[] dolu ise:
// Tam ekran modal → badge emoji büyük + isim + "Unlocked!" animasyonu
// Reanimated scale + opacity animasyonu
// +5 NC ödülü göster
// "Awesome!" kapatma butonu
```

---

## ADIM 4: Profile Upgrade

### 4.1 Badges Section

```typescript
// components/profile/BadgesSection.tsx

// Kazanılmış badge'ler: renkli, emoji büyük
// Kazanılmamış: gri, kilitli ikon
// Grid layout: 3-4 sütun
// Tıklayınca: badge detay (nasıl kazanılır)
```

### 4.2 Brain Points & Neural Coins

```typescript
// Profile header'a ekle:
// 🧠 156 BP  |  💰 85 NC  |  🔥 5 streak

// StatsRow component'ını güncelle:
// Mevcut: streak, coins, tests
// Yeni: brainPoints ekle
```

### 4.3 Daily Stats Section

```typescript
// Profile'da "Daily Challenge" bölümü:
// Streak: 5 days (longest: 12)
// Accuracy: 72%
// Total attempts: 18
```

---

## ADIM 5: Home Ekranı Güncelleme

### 5.1 Daily Challenge Kartı

```typescript
// components/home/DailyChallengeCard.tsx

// Home ekranında "Start IQ Test" butonunun ALTINDA:
// ┌────────────────────────────────┐
// │ 🧠 Daily Brain Snatch         │
// │ Today's challenge is ready!    │
// │ 🔥 5 day streak               │
// │ [Solve Now →]                  │
// └────────────────────────────────┘

// Zaten cevaplamışsa:
// ┌────────────────────────────────┐
// │ ✅ Daily Complete!             │
// │ You got it right! +15 BP      │
// │ 🔥 5 day streak               │
// │ Come back tomorrow             │
// └────────────────────────────────┘

// useQuery ile GET /api/daily/today → alreadyAttempted kontrolü
// Tıklayınca → router.push('/daily')
```

### 5.2 StatsRow Güncelleme

```typescript
// Mevcut StatsRow: streak, NC, tests taken
// Güncelle: streak (from daily), NC (from user), brain points
// GET /api/auth/me'den gelen verileri kullan
```

---

## ADIM 6: i18n Güncellemeleri

Tüm 16 locale dosyasına yeni key'ler ekle:

```json
{
  "daily": {
    "title": "Daily Brain Snatch",
    "todayChallenge": "Today's Challenge",
    "alreadyDone": "You already answered today!",
    "comeBackTomorrow": "Come back tomorrow for more",
    "peopleAttempted": "{{count}} people attempted today",
    "gotItRight": "{{percent}}% got it right",
    "correct": "Correct!",
    "incorrect": "Incorrect",
    "pointsEarned": "+{{points}} Brain Points",
    "coinsEarned": "+{{coins}} Neural Coins",
    "streakDays": "{{count}} day streak",
    "solveNow": "Solve Now",
    "dailyComplete": "Daily Complete!",
    "noChallenge": "No challenge available today"
  },
  "badges": {
    "title": "Badges",
    "unlocked": "Badge Unlocked!",
    "locked": "Keep going to unlock",
    "earned": "Earned {{date}}"
  },
  "profile": {
    "brainPoints": "Brain Points",
    "neuralCoins": "Neural Coins",
    "dailyStats": "Daily Challenge Stats",
    "accuracy": "Accuracy",
    "longestStreak": "Longest Streak"
  }
}
```

---

## ADIM 7: Store Hazırlık

### 7.1 EAS Build Konfigürasyonu

```bash
# EAS CLI yükle
npm install -g eas-cli

# EAS'e login ol
eas login

# Build config oluştur
eas build:configure
```

### 7.2 eas.json

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": { "buildConfiguration": "Release" }
    }
  }
}
```

### 7.3 app.json Finalize

```json
{
  "expo": {
    "name": "NeuralQ - IQ Test",
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
      },
      "package": "com.neuralq.app",
      "versionCode": 1
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.neuralq.app",
      "buildNumber": "1"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-router"],
    "extra": {
      "eas": { "projectId": "YOUR_EAS_PROJECT_ID" }
    }
  }
}
```

### 7.4 Production API URL

```env
# .env.production (veya EAS secrets)
EXPO_PUBLIC_API_URL=https://api.neuralq.app
```

### 7.5 Preview Build (APK test)

```bash
# Android APK oluştur (test için)
eas build --platform android --profile preview

# Build bitince APK linkini indir ve telefona yükle
```

---

## BİTİRME KONTROL LİSTESİ

```
✅ DAILY CHALLENGE
  ✅ GET /api/daily/today → veri yükleniyor
  ✅ Soru kartı doğru render ediliyor (text + options + timer)
  ✅ Cevap gönderiliyor → sonuç gösteriliyor
  ✅ Doğru → yeşil + BP + NC + streak
  ✅ Zaten cevaplamışsa → "Already done" ekranı
  ✅ Home'da daily card görünüyor

✅ BADGES
  ✅ Profile'da badge grid'i görünüyor (kazanılmış renkli, diğerleri gri)
  ✅ Badge kazanılınca modal popup gösteriliyor
  ✅ Badge detayı tıklanınca açıklama görünüyor

✅ PROFILE UPGRADE
  ✅ Brain Points + Neural Coins header'da
  ✅ Daily stats bölümü (streak, accuracy)
  ✅ Badges section

✅ HOME
  ✅ DailyChallengeCard eklendi
  ✅ StatsRow güncellendi (BP, NC)

✅ i18n
  ✅ 16 dilde daily, badges, profile key'leri

✅ STORE
  ✅ eas.json konfigüre edildi
  ✅ app.json package/bundleIdentifier ayarlandı
  ✅ Preview APK build başarılı (opsiyonel)

✅ DERLEME
  ✅ npx tsc --noEmit → Sıfır hata
  ✅ npx expo start -c → hatasız çalışıyor
```
