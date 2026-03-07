# API Auth Contract — Mobile ↔ Backend

> Bu dosya mobil uygulamanın backend'e gönderdiği ve beklediği auth endpoint'lerinin tam spesifikasyonudur.
> Backend geliştirici bu dosyayı okuyarak uyumluluk sağlamalıdır.

---

## Base URL

```
http://192.168.100.37:3000/api
```

---

## 1. POST /auth/register

Yeni kullanıcı kaydı.

### Request

```json
{
  "email": "user@example.com",       // zorunlu, valid email
  "password": "123456",              // zorunlu, min 6 karakter
  "username": "neuralq_user",        // zorunlu, min 3 karakter
  "age": 25,                         // opsiyonel, number
  "country": "TR",                   // opsiyonel, 2 harf ISO ülke kodu
  "language": "tr"                   // opsiyonel, TAM 2 KARAKTER (ISO 639-1)
}
```

**language alanı hakkında NOT:**
- Mobil tarafta 16 dil + `"other"` seçeneği var
- `"other"` seçildiğinde mobil backend'e `"en"` gönderir (2 karakter kuralını bozmamak için)
- Backend bu alanı `z.string().length(2)` ile validate ediyorsa → doğru davranış
- Desteklenen dil kodları: `en`, `tr`, `az`, `ru`, `zh`, `es`, `hi`, `ar`, `pt`, `fr`, `de`, `ja`, `ko`, `it`, `pl`, `id`

### Success Response — 201

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "username": "neuralq_user",
      "displayName": null,
      "avatarUrl": null,
      "role": "USER",
      "age": 25,
      "country": "TR",
      "city": null,
      "language": "tr",
      "school": null,
      "neuralCoins": 0,
      "brainPoints": 0,
      "currentStreak": 0,
      "longestStreak": 0,
      "badges": [],
      "themePreference": "cyberpunk"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 400 | Validation hatası (eksik/geçersiz alan) | `{ "success": false, "error": "email: Invalid email" }` |
| 400 | language 2 karakter değilse | `{ "success": false, "error": "language: String must contain exactly 2 character(s)" }` |
| 409 | Email veya username zaten var | `{ "success": false, "error": "email already exists" }` |

---

## 2. POST /auth/login

Email + password ile giriş.

### Request

```json
{
  "email": "user@example.com",    // zorunlu
  "password": "123456"            // zorunlu
}
```

### Success Response — 200

```json
{
  "success": true,
  "data": {
    "user": { ... },              // Tam User objesi (register ile aynı format)
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 400 | Eksik alan | `{ "success": false, "error": "email: Required" }` |
| 401 | Yanlış email veya şifre | `{ "success": false, "error": "Invalid email or password" }` |

---

## 3. POST /auth/google

Google OAuth ile giriş/kayıt. Kullanıcı yoksa otomatik oluşturur.

### Request

```json
{
  "idToken": "eyJhbGciOi..."     // zorunlu, Google Sign-In'den alınan ID token
}
```

**Mobil tarafın idToken alma akışı:**
1. `expo-auth-session` ile Google OAuth açılır
2. Kullanıcı Google hesabını seçer
3. `response.params.id_token` alınır
4. Bu token backend'e gönderilir

### Success Response — 200

```json
{
  "success": true,
  "data": {
    "user": { ... },              // Tam User objesi
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Backend davranışı:**
- Google token verify edilir
- Email ile kullanıcı aranır
  - Varsa ve googleId yoksa → hesaba Google bağlanır
  - Yoksa → yeni kullanıcı oluşturulur (username: email_prefix_xxxx)
- JWT access + refresh token döner

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 400 | idToken eksik | `{ "success": false, "error": "idToken: Required" }` |
| 401 | Geçersiz/expired token | `{ "success": false, "error": "Invalid Google token" }` |

---

## 4. POST /auth/refresh

Token yenileme.

### Request

```json
{
  "refreshToken": "eyJhbGciOi..."    // zorunlu
}
```

### Success Response — 200

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 400 | Eksik alan | `{ "success": false, "error": "refreshToken: Required" }` |
| 401 | Geçersiz/expired token | `{ "success": false, "error": "Invalid or expired refresh token" }` |

---

## 5. GET /auth/me

Mevcut kullanıcı bilgisi. Authorization header gerekli.

### Request

```
GET /api/auth/me
Authorization: Bearer <accessToken>
```

### Success Response — 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "neuralq_user",
    "displayName": null,
    "avatarUrl": null,
    "role": "USER",
    "age": 25,
    "country": "TR",
    "city": null,
    "language": "tr",
    "school": null,
    "neuralCoins": 0,
    "brainPoints": 0,
    "currentStreak": 0,
    "longestStreak": 0,
    "badges": [],
    "themePreference": "cyberpunk"
  }
}
```

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 401 | Token yok veya geçersiz | `{ "success": false, "error": "Unauthorized" }` |

**NOT:** `passwordHash` ve `refreshToken` response'da OLMAMALI (güvenlik).

---

## 6. PATCH /auth/me

Profil güncelleme. Authorization header gerekli.

### Request

```json
{
  "username": "new_name",          // opsiyonel, min 3 karakter
  "displayName": "John Doe",      // opsiyonel
  "age": 30,                      // opsiyonel
  "country": "US",                // opsiyonel, 2 harf
  "city": "New York",             // opsiyonel
  "school": "MIT",                // opsiyonel
  "language": "en",               // opsiyonel, TAM 2 KARAKTER
  "themePreference": "clean"      // opsiyonel, "cyberpunk" | "clean"
}
```

### Success Response — 200

```json
{
  "success": true,
  "data": { ... }                 // Güncellenmiş tam User objesi
}
```

### Error Responses

| Status | Durum | Response |
|--------|-------|----------|
| 400 | Validation hatası | `{ "success": false, "error": "username: String must contain at least 3 character(s)" }` |
| 409 | Username zaten var | `{ "success": false, "error": "username already exists" }` |

---

## Genel Kurallar

### Response Format
Tüm endpoint'ler aynı format kullanır:
```json
// Başarılı:
{ "success": true, "data": { ... } }

// Hata:
{ "success": false, "error": "hata mesajı" }
```

### Authentication
- `Authorization: Bearer <accessToken>` header'ı ile gönderilir
- 401 dönünce mobil otomatik olarak `/auth/refresh` çağırır
- Refresh da 401 dönerse → kullanıcı logout edilir

### Mobil Tarafın Kullandığı TypeScript Tipleri

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  age: number | null;
  country: string | null;
  city: string | null;
  language: string;
  school: string | null;
  neuralCoins: number;
  brainPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  themePreference: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  username: string;
  age?: number;
  country?: string;
  language?: string;    // "other" → "en" olarak dönüştürülür
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

---

## Uyumluluk Kontrol Listesi

Backend geliştirici bu listeyi kontrol etmeli:

```
□ POST /auth/register — language alanı 2 karakter zorunlu mu? (mobil "other" → "en" gönderiyor)
□ POST /auth/register — username min 3, password min 6 validation var mı?
□ POST /auth/register — duplicate email/username → 409 döner mi?
□ POST /auth/login — yanlış şifre → 401 döner mi (500 değil)?
□ POST /auth/google — idToken verify ediliyor mu?
□ POST /auth/google — yeni kullanıcı oluşturma çalışıyor mu?
□ POST /auth/refresh — expired/invalid token → 401 döner mi?
□ GET /auth/me — passwordHash ve refreshToken response'da YOK mu?
□ PATCH /auth/me — tüm opsiyonel alanlar güncellenebiliyor mu?
□ Tüm hata response'ları { success: false, error: "..." } formatında mı?
□ 500 hatası hiçbir endpoint'te olmuyor mu?
```
