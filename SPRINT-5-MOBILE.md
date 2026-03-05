# SPRINT-5-MOBILE.md — NeuralQ Mobile Entegrasyon, Bug Fix & Production Hazırlık

> **DURUM**: Mobil uygulama 9 adımda tamamlandı ve standalone repo'da çalışıyor. Temel akışlar hazır: onboarding, auth, test engine, sonuç ekranı, leaderboard, profile. Bu sprint backend entegrasyonunu test edip, eksikleri tamamlayıp, production'a hazırlıyor.
>
> **REPO**: `neuralq-mobile/` (standalone, `iq_test/` monorepo'dan ayrı)
> **Backend API**: `http://192.168.100.37:3000/api` (Port 3000!)
> **GitHub**: `https://github.com/kerim-agayev/neuralq-mobile.git`

---

## Mevcut Durum — Neler Hazır, Neler Eksik?

### Hazır (9 Adım Tamamlandı)

| Özellik | Durum |
|---------|-------|
| Expo SDK 54 + TypeScript + Expo Router | ✅ |
| Auth (onboarding, login, register) | ✅ |
| Zustand stores (auth, test, settings) | ✅ |
| API client + JWT interceptor + refresh | ✅ |
| Cyberpunk + Clean dual theme | ✅ |
| 16 dil i18n + "Other Language" | ✅ |
| Bottom tabs (Home, Leaderboard, Profile) | ✅ |
| Home ekranı (stats, last result, quick test button) | ✅ |
| Test engine (question card, timer, options, streak, feedback) | ✅ |
| Text/Image/Mixed option layouts | ✅ |
| Result screen (IQ reveal, spider chart, celebrity, cognitive age) | ✅ |
| Leaderboard (global + country) | ✅ |
| Profile (header, test history, settings) | ✅ |
| History detail page | ✅ |

### Eksik / Test Edilecek

| Özellik | Durum | Sprint |
|---------|-------|--------|
| **Backend ile tam entegrasyon testi** | ⚠️ Test gerekli | **Sprint 5** |
| **Leaderboard backend bağlantısı** | ❌ Backend endpoint yok | Sprint 5 Backend |
| **Gerçek cihazda end-to-end test** | ❌ Yapılmadı | **Sprint 5** |
| **Error handling iyileştirme** | ⚠️ Basic var | **Sprint 5** |
| **Offline fallback / retry logic** | ❌ Eksik | **Sprint 5** |
| **Share card image generation** | ⚠️ Buton var, generate yok | **Sprint 5** |
| **PDF Certificate download** | ❌ Eksik | **Sprint 5** |
| **Seed data ile gerçek test** | ❌ Yapılmadı | **Sprint 5** |
| **Loading states & skeleton screens** | ⚠️ Basic var | **Sprint 5** |
| **Keyboard handling** | ⚠️ Kontrol gerekli | **Sprint 5** |
| **App icon & splash screen** | ❌ Placeholder | **Sprint 5** |
| **Push notifications** | ❌ Phase 2 | Sonraki sprint |
| **Daily Challenge** | ❌ Phase 2 | Sonraki sprint |
| **Neural Coins economy** | ❌ Phase 2 | Sonraki sprint |

---

## Kapsam — 7 Adım

| Adım | İçerik |
|------|--------|
| 1 | Backend entegrasyon testi — tüm API akışlarını gerçek data ile test et |
| 2 | Error handling & retry logic |
| 3 | Share card image generation |
| 4 | PDF Certificate download |
| 5 | Loading states & UX polish |
| 6 | App icon, splash screen, branding |
| 7 | End-to-end test + bug fix |

---

## ADIM 1: Backend Entegrasyon Testi

### 1.1 Test Checklist

Backend çalışır durumda olmalı (`http://192.168.100.37:3000`). Her akışı sırayla test et:

```
TEST 1: Register
  - Yeni kullanıcı oluştur (username, email, password, age, country, language)
  - Response'da accessToken ve refreshToken geliyor mu?
  - Otomatik login olup home'a yönleniyor mu?

TEST 2: Login
  - Oluşturulan kullanıcıyla login
  - Token kaydediliyor mu?
  - Home'da kullanıcı bilgileri görünüyor mu?

TEST 3: Start Test (Arcade)
  - "Start IQ Test" → Arcade seç
  - Backend'den sorular geliyor mu?
  - Kaç soru geldi? (Arcade ~15)
  - Her sorunun timeLimit'i var mı?
  - Options formatı doğru mu? ({ text, imageUrl? })

TEST 4: Answer Questions
  - Bir soruyu cevapla
  - POST /answer response geliyor mu? (isCorrect, correctAnswer, explanation)
  - Doğru/yanlış animasyon çalışıyor mu?
  - Timer doğru mu? (soruya özel süre)

TEST 5: Complete Test
  - Tüm soruları cevapla
  - POST /complete response'da IQ, categoryScores, celebrity geldi mi?
  - Result ekranında veriler doğru görünüyor mu?
  - Spider chart doğru mu?

TEST 6: Leaderboard
  - Global leaderboard yükleniyor mu? (Sprint 5 Backend tamamlandıktan sonra)
  - Country leaderboard çalışıyor mu?

TEST 7: Profile
  - Test history yükleniyor mu?
  - Eski test sonuçlarına tıklayınca detay açılıyor mu?

TEST 8: Token Refresh
  - 15 dakika bekle (veya accessToken'ı elle kısalt)
  - API çağrısı 401 döndüğünde refresh otomatik çalışıyor mu?
  - Refresh da başarısız olursa login'e yönleniyor mu?
```

### 1.2 Olası Hatalar ve Çözümleri

```typescript
// HATA: "Network Error" — backend'e bağlanamıyor
// ÇÖZÜM: .env'de EXPO_PUBLIC_API_URL doğru mu? Port 3000 mü?
// Telefon ve bilgisayar aynı WiFi'da mı?

// HATA: "Request failed with status 404" — endpoint yok
// ÇÖZÜM: Backend'deki route path'leri kontrol et
// Mobilde /api/tests/start çağrılıyor ama backend /api/test/start olabilir

// HATA: Options formatı uyumsuzluğu
// ÇÖZÜM: Backend string[] mı object[] mı dönüyor kontrol et
// Mobil { text, imageUrl? } bekliyor

// HATA: "Cannot read property 'iqScore' of undefined"
// ÇÖZÜM: Backend complete response formatını kontrol et
// data.data mı data mı?
```

---

## ADIM 2: Error Handling & Retry Logic

### 2.1 Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
// React error boundary — app crash olursa güzel bir hata ekranı göster
// "Oops! Something went wrong" + "Try Again" butonu
```

### 2.2 API Error Handler

```typescript
// services/api.ts — response interceptor'a ekle:

// Timeout handling
api.defaults.timeout = 15000;

// Network error toast
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (!error.response) {
      // Network error — internet yok veya backend kapalı
      Toast.show({
        type: 'error',
        text1: t('errors.network'),
        text2: t('errors.checkConnection'),
      });
    } else if (error.response.status === 500) {
      Toast.show({
        type: 'error',
        text1: t('errors.server'),
      });
    }
    // ... mevcut 401 refresh logic
    return Promise.reject(error);
  }
);
```

### 2.3 Test Session Recovery

```typescript
// Eğer test sırasında uygulama crash olursa veya internet kesilirse:
// 1. Her cevap AsyncStorage'a da kaydedilsin (backup)
// 2. App açıldığında incomplete session varsa → "Continue test?" dialog
// 3. Backend'de session timeout: 30 dakika sonra ABANDONED olarak işaretle

// store/test.store.ts'e backup logic ekle:
recordAnswer: async (questionId, selected, timeMs, result) => {
  // Mevcut logic + AsyncStorage backup
  const answers = get().answers;
  await AsyncStorage.setItem('testBackup', JSON.stringify({
    sessionId: get().sessionId,
    answers: [...answers, { questionId, selected, timeMs, isCorrect: result.isCorrect }],
  }));
};
```

---

## ADIM 3: Share Card Image Generation

```typescript
// components/results/ShareCard.tsx

// React Native'de component'ı image'a çevirme:
// 1. react-native-view-shot YERINE expo-print + expo-sharing kullan (Expo Go uyumlu)
// 2. VEYA: Backend'de share card generate et → URL döndür → share et

// Yaklaşım A: Backend-side (Önerilen)
// POST /api/results/:id/share → backend image generate eder → Cloudinary'ye yükler → URL döner
// Mobil bu URL'yi expo-sharing ile paylaşır

// Yaklaşım B: Client-side (Expo Go ile sınırlı)
// HTML string oluştur → expo-print ile PDF'e çevir → expo-sharing ile paylaş

// Basit implementasyon (Yaklaşım B):
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

async function shareResult(result: TestResult) {
  const html = `
    <html>
    <body style="background:#0a0a0f;color:white;text-align:center;padding:40px;font-family:sans-serif;">
      <h1 style="color:#00f5ff;font-size:48px;">NeuralQ</h1>
      <h2 style="font-size:72px;color:#00f5ff;">${result.iqScore}</h2>
      <p style="font-size:24px;">IQ Score</p>
      <p style="font-size:20px;color:#888;">${result.celebrityMatch?.replace('_', ' ')}</p>
      <p style="font-size:14px;color:#555;margin-top:40px;">Take your test at neuralq.app</p>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, width: 1080, height: 1080 });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share IQ Result' });
}
```

---

## ADIM 4: PDF Certificate Download

```typescript
// Backend: GET /api/results/:id/certificate → PDF buffer
// Mobil: İndir ve paylaş

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function downloadCertificate(resultId: string) {
  const token = await AsyncStorage.getItem('accessToken');
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fileUri = FileSystem.documentDirectory + `neuralq-certificate-${resultId}.pdf`;

  const download = await FileSystem.downloadAsync(
    `${API_URL}/api/results/${resultId}/certificate`,
    fileUri,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (download.status === 200) {
    await Sharing.shareAsync(download.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'NeuralQ Certificate',
    });
  } else {
    Toast.show({ type: 'error', text1: 'Download failed' });
  }
}
```

---

## ADIM 5: Loading States & UX Polish

### 5.1 Skeleton Screens

```typescript
// Test yüklenirken, leaderboard yüklenirken, profile yüklenirken
// Skeleton placeholders göster (pulsating gray boxes)
// Simple approach: Animated.View ile opacity pulse

// components/ui/Skeleton.tsx
```

### 5.2 Empty States

```typescript
// Leaderboard boşsa → "No data yet. Be the first!" mesajı
// Test history boşsa → "Take your first test!" mesajı + start butonu
// Her empty state için illüstrasyon (emoji veya basit ikon)
```

### 5.3 Keyboard Handling

```typescript
// Login/Register formlarında:
// KeyboardAvoidingView kullan (Platform.OS === 'ios' ? 'padding' : 'height')
// ScrollView + keyboard dismiss on tap
```

### 5.4 Pull to Refresh

```typescript
// Leaderboard ve Profile'da pull-to-refresh ekle
// RefreshControl component'i
```

---

## ADIM 6: App Icon & Splash Screen

### 6.1 Gerekli Görseller

```
assets/
  icon.png          — 1024x1024 (app icon)
  splash-icon.png   — 200x200 (splash center icon)
  adaptive-icon.png — 1024x1024 (Android adaptive icon, foreground)
  favicon.png       — 48x48 (web)
```

### 6.2 Tasarım

```
App Icon: Siyah arka plan + cyan neon "NQ" harfleri veya beyin ikonu
Splash: Siyah (#0a0a0f) arka plan + ortada küçük NeuralQ logosu
```

### 6.3 app.json Güncelle

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0f"
    }
  }
}
```

---

## ADIM 7: End-to-End Test

### Tam Akış Testi

```
1. Uygulamayı sil ve yeniden aç
2. Onboarding → Azerbaijani dili seç → Get Started
3. Register → kerim / kerim@test.com / Test1234 / 25 / Azerbaijan
4. Home ekranı açıldı → "Start IQ Test" bas
5. Arcade seç → 15 soru gel
6. Tüm soruları cevapla (bazıları doğru, bazıları yanlış)
7. Timer çalışıyor mu? Doğru sürelerde mi?
8. Streak counter çalışıyor mu?
9. Son soru bittikten sonra result ekranı açılıyor mu?
10. IQ skoru mantıklı mı? (70-150 arası)
11. Spider chart doğru mu?
12. Celebrity match doğru aralıkta mı?
13. Share butonu çalışıyor mu?
14. Home'a dön → "Last Result" kartında sonuç görünüyor mu?
15. Leaderboard → veriler yükleniyor mu?
16. Profile → test history'de az önceki test var mı?
17. Settings → theme toggle → anında değişiyor mu?
18. Settings → language → Türkçe seç → tüm UI Türkçe'ye döndü mü?
19. Logout → login'e yönleniyor mu?
20. Login → geri gir → veriler korunuyor mu?
```

### Bug Report Şablonu

Her bulunan bug için:
```
BUG: [Kısa açıklama]
ADIM: [Nasıl reproduce edilir]
BEKLENEN: [Ne olmalıydı]
GERÇEK: [Ne oldu]
SCREENSHOT: [varsa]
```

---

## BİTİRME KONTROL LİSTESİ

```
✅ ENTEGRASYON
  ✅ Register → backend'de user oluşuyor
  ✅ Login → token alınıyor
  ✅ Test start → sorular geliyor
  ✅ Answer → doğru/yanlış dönüyor
  ✅ Complete → IQ hesaplanıyor
  ✅ Leaderboard → sıralama yükleniyor
  ✅ History → geçmiş testler yükleniyor
  ✅ Token refresh → otomatik çalışıyor

✅ ERROR HANDLING
  ✅ Network error → toast gösteriliyor
  ✅ 500 error → toast gösteriliyor
  ✅ Test backup → AsyncStorage'da saklanıyor
  ✅ Empty states düzgün gösteriliyor

✅ PAYLAŞIM
  ✅ Share card → PDF/image oluşturuluyor + paylaşılıyor
  ✅ Certificate → backend'den PDF indiriliyor + paylaşılıyor

✅ UX
  ✅ Skeleton loading screens
  ✅ Pull to refresh (leaderboard, profile)
  ✅ Keyboard handling (login, register)
  ✅ App icon ve splash screen yerleştirildi

✅ END-TO-END
  ✅ 20 adımlık tam akış testi geçti
  ✅ Bulunan bug'lar düzeltildi
```
