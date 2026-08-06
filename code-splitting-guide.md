# Code Splitting Guide — Chorus.vn Admin Routes

> **Mục đích**: Tài liệu hướng dẫn chi tiết để agent tương lai thực hiện code splitting, tách admin code ra khỏi bundle chính nhằm giảm ~50% JS payload cho public visitors.

---

## 1. Bối Cảnh & Vấn Đề

### Hiện trạng
- **File chính**: `src/App.tsx` — **28,260 dòng**, 1.71 MB source
- **Build output**: `index.js` — **1,764 KB** (gzip 429 KB)
- **Vendor chunks đã tách**: `vendor-react` (49KB), `vendor-motion` (97KB), `vendor-lucide` (36KB)
- **Vite build config**: `vite.config.ts` với `manualChunks` cho react, motion, lucide

### Vấn đề
99%+ visitors chỉ xem trang public (nghe nhạc, xem profile), nhưng phải tải toàn bộ 1,764 KB bao gồm cả admin dashboard, song editor, playlist editor... mà họ không bao giờ dùng.

### Mục tiêu
Tách admin components thành lazy-loaded chunks → public visitors chỉ tải ~900 KB thay vì 1,764 KB.

---

## 2. Bản Đồ Cấu Trúc File Hiện Tại

### 2.1 Cấu trúc App.tsx (28,260 dòng)

```
Dòng 1–15       │ Imports (react, react-router, lucide, motion, etc.)
Dòng 16–300     │ Shared utilities (Portal, useBrandColors, getLuminance, etc.)
Dòng 300–1800   │ Shared UI components (DreamySongCard, MusicianSongCard, MusicianWallFrames, etc.)
Dòng 1800–1966  │ MarqueeText, formatText
Dòng 1967–2000  │ renderArtistNameWithLinks
Dòng 2000–5823  │ Translation dictionaries (vi, en, ko, ja, th, zh)
Dòng 5824–5878  │ useAdminTranslation hook + helpers (getThumbUrl, handleImageError)
Dòng 5880–6718  │ Global utilities (getArtistExtensionFromUrl, getAdminLink, getArtistLink,
                │   auth token functions, uploadWithProgress, compressImageToJPG, etc.)
Dòng 6715–6718  │ Late imports (ACPControlPanel, ChorusVNLanding, ExploreFeatures, HelpPage)
Dòng 6720–7060  │ AdminLogin component
Dòng 7061–7190  │ MemberLogin component
Dòng 7191–7278  │ RequireAdmin wrapper
Dòng 7279–7365  │ VerifyEmailPage
Dòng 7366–7479  │ AnimatedRoutes (main router)
Dòng 7481–7976  │ AdminFloatingControls + UnifiedArtistSessionFloatingWidget
Dòng 7977–8092  │ AdminFloatingAddButton
Dòng 8093–9109  │ Shared rendering utilities (getRandomSongCardStyles, renderContainedEffect, etc.)
Dòng 9110–9234  │ App() root component (LanguageContext provider, BrowserRouter)
Dòng 9236–10065 │ AutoTranslate, AchievementBadge, Home-related utilities
Dòng 10066–13671│ Home() component — TRANG CHỦ NGHỆ SĨ
Dòng 13672–14341│ DemoPlayer utilities & shared sub-components
Dòng 14342–14876│ PlaylistPlayer
Dòng 14877–16739│ DemoPlayer (export function)
Dòng 16740–16903│ SocialCarousel
Dòng 16904–17687│ AdminTemplatesSettings, AdminTemplateEdit, AdminDatabaseSettings
Dòng 17689–23286│ AdminDashboard — DASHBOARD CHÍNH (~5,600 dòng)
Dòng 23287–24646│ AdminCreateDemo (~1,360 dòng)
Dòng 24647–26180│ AdminEditDemo (~1,530 dòng)
Dòng 26181–26587│ AdminPlaylistEdit (~407 dòng)
Dòng 26588–27025│ AdminAboutEdit (~437 dòng)
Dòng 27026–27216│ AdminBioEdit (~190 dòng)
Dòng 27217–27340│ AdminMenuEdit (~123 dòng)
Dòng 27341–28260│ AdminLayoutEdit + exports (~920 dòng)
```

### 2.2 Phân loại Admin vs Public

| Category | Dòng bắt đầu | Dòng kết thúc | ~Số dòng | Ghi chú |
|----------|-------------|-------------|----------|---------|
| **ADMIN: AdminLogin** | 6,741 | 7,060 | ~320 | Cần giữ trong bundle chính (login page) |
| **ADMIN: RequireAdmin** | 7,191 | 7,278 | ~87 | Wrapper, nhỏ, giữ trong bundle chính |
| **ADMIN: AdminFloating*3** | 7,481 | 8,092 | ~611 | Floating controls, hiện trên mọi trang khi đã login |
| **ADMIN: AdminDashboard** | 16,904 | 23,286 | **~6,382** | ⭐ CẦN TÁCH — chunk lớn nhất |
| **ADMIN: AdminCreateDemo** | 23,287 | 24,646 | **~1,360** | ⭐ CẦN TÁCH |
| **ADMIN: AdminEditDemo** | 24,647 | 26,180 | **~1,533** | ⭐ CẦN TÁCH |
| **ADMIN: AdminPlaylistEdit** | 26,181 | 26,587 | **~407** | ⭐ CẦN TÁCH |
| **ADMIN: AdminAboutEdit** | 26,588 | 27,025 | **~437** | ⭐ CẦN TÁCH (sub-component của Dashboard) |
| **ADMIN: AdminBioEdit** | 27,026 | 27,216 | **~190** | ⭐ CẦN TÁCH |
| **ADMIN: AdminMenuEdit** | 27,217 | 27,340 | **~123** | ⭐ CẦN TÁCH |
| **ADMIN: AdminLayoutEdit** | 27,341 | 28,260 | **~920** | ⭐ CẦN TÁCH |
| **Tổng cần tách** | | | **~11,352** | ~40% file App.tsx |

### 2.3 Đã tách thành file riêng (trong `src/components/`)

| File | Size | Ghi chú |
|------|------|---------|
| `ACPControlPanel.tsx` | 349 KB | Master admin panel — ĐÃ TÁCH nhưng import tĩnh |
| `ChorusVNLanding.tsx` | 157 KB | Landing page — ĐÃ TÁCH nhưng import tĩnh |
| `ExploreFeatures.tsx` | 32 KB | Explore page |
| `HelpPage.tsx` | 62 KB | Help page |
| `RegisterModal.tsx` | 31 KB | Modal đăng ký |
| `IndirectBioCard.tsx` | 53 KB | Bio card component |

> **Lưu ý**: Các file trên đã tách nhưng vẫn dùng `import` tĩnh (dòng 6715–6718), nên Vite vẫn bundle hết vào `index.js`.

---

## 3. Shared Dependencies (Phải Tách Ra Module Chung)

### 3.1 Hooks & Context

| Dependency | Dòng | Dùng bởi Admin? | Dùng bởi Public? |
|-----------|------|-----------------|-------------------|
| `LanguageContext` | ~5,850 | ✅ | ✅ |
| `useAdminTranslation()` | 5,824 | ✅ | ✅ |
| Translation dictionaries (vi/en/ko/ja/th/zh) | 2,000–5,823 | ✅ | ✅ |

### 3.2 Utility Functions

| Function | Dòng | Admin? | Public? |
|----------|------|--------|---------|
| `getArtistExtensionFromUrl()` | 5,881 | ✅ | ✅ |
| `isArtistContext()` | 5,926 | ✅ | ✅ |
| `getAdminLink()` | 5,939 | ✅ | ❌ |
| `getArtistLink()` | 5,948 | ✅ | ✅ |
| `getArtistFullUrl()` | 5,997 | ✅ | ✅ |
| `sanitizePlaylistPassword()` | 6,006 | ✅ | ✅ |
| `getAdminToken/setAdminToken/removeAdminToken` | 6,014–6,206 | ✅ | ✅ (RequireAdmin) |
| `getMemberToken/setMemberToken/removeMemberToken` | 6,207–6,230 | ❌ | ✅ |
| `setGlobalCookie/getGlobalCookie/removeGlobalCookie` | 6,017–6,050 | ✅ | ✅ |
| `getActiveAdminSession()` | 6,097 | ✅ | ✅ |
| `getArtistAdminRedirect()` | 6,051 | ✅ | ✅ |
| `uploadWithProgress()` | ~6,580–6,713 | ✅ | ❌ |
| `compressImageToJPG()` | 6,682 | ✅ | ❌ |
| `formatFileName()` | 6,579 | ✅ | ❌ |
| `getThumbUrl()` | 5,859 | ✅ | ✅ |
| `handleImageError()` | 5,869 | ✅ | ✅ |

### 3.3 Shared UI Components

| Component | Dòng | Admin? | Public? |
|-----------|------|--------|---------|
| `Portal` | 16 | ✅ | ✅ |
| `BrandLogoColorExtractor` | 230 | ✅ | ✅ |
| `MarqueeText` | 1,802 | ✅ | ✅ |
| `DreamySongCard` | 445 | ❌ | ✅ |
| `MusicianSongCard` | 1,207 | ❌ | ✅ |
| `MusicianWallFrames` | 1,054 | ❌ | ✅ |
| `ArtistNameMarquee` | 325 | ❌ | ✅ |
| `SongTitleMarquee` | 369 | ❌ | ✅ |
| `PasswordInput` | 6,722 | ✅ | ✅ |
| `DemoPlayer` (export) | 14,877 | ✅ (preview) | ✅ |
| `LoadingScreen` | (external) | ✅ | ✅ |

### 3.4 Types

```typescript
// src/types.ts — ĐÃ tách riêng
import { AppData, DemoSong, TemplateConfig, Achievement } from './types';
```

---

## 4. Kế Hoạch Thực Hiện

### Phase 1: Tạo shared utils module

**Tạo file**: `src/utils/shared.ts`

```typescript
// Di chuyển các hàm sau từ App.tsx vào đây:
export { getArtistExtensionFromUrl }
export { isArtistContext }
export { getAdminLink, getArtistLink, getArtistFullUrl }
export { getAdminToken, setAdminToken, removeAdminToken }
export { getMemberToken, setMemberToken, removeMemberToken }
export { setGlobalCookie, getGlobalCookie, removeGlobalCookie }
export { getActiveAdminSession, getArtistAdminRedirect, getLogoutRedirectUrl }
export { sanitizePlaylistPassword }
export { getThumbUrl, handleImageError }
export { LanguageContext, useAdminTranslation }
// ... và các helper khác
```

**Tạo file**: `src/utils/adminUtils.ts` (admin-only utilities)

```typescript
// Di chuyển các hàm CHỈ admin dùng:
export { uploadWithProgress }
export { compressImageToJPG }
export { formatFileName }
```

### Phase 2: Tách admin components thành files riêng

Tạo các file sau trong `src/components/admin/`:

| File mới | Nội dung từ App.tsx | ~Số dòng |
|----------|-------------------|----------|
| `AdminDashboard.tsx` | Dòng 16,904–23,286 + sub-components (AdminTemplatesSettings, AdminTemplateEdit, AdminDatabaseSettings, AdminAboutEdit, AdminBioEdit, AdminMenuEdit, AdminLayoutEdit) | ~11,000+ |
| `AdminCreateDemo.tsx` | Dòng 23,287–24,646 | ~1,360 |
| `AdminEditDemo.tsx` | Dòng 24,647–26,180 | ~1,533 |
| `AdminPlaylistEdit.tsx` | Dòng 26,181–26,587 | ~407 |

> **LƯU Ý**: `AdminAboutEdit`, `AdminBioEdit`, `AdminMenuEdit`, `AdminLayoutEdit` là sub-components được `AdminDashboard` render trực tiếp. Nên đưa chúng vào cùng file `AdminDashboard.tsx` hoặc import nội bộ.

### Phase 3: Lazy import trong AnimatedRoutes

**Thay đổi trong `App.tsx`** (dòng ~7,443):

```tsx
// TRƯỚC (import tĩnh - mọi thứ bundle vào index.js):
// function AdminDashboard() { ... } // 5,600 dòng ngay trong file

// SAU (lazy import - tách thành chunk riêng):
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const AdminCreateDemo = React.lazy(() => import('./components/admin/AdminCreateDemo'));
const AdminEditDemo = React.lazy(() => import('./components/admin/AdminEditDemo'));
const AdminPlaylistEdit = React.lazy(() => import('./components/admin/AdminPlaylistEdit'));
```

**Wrap routes với Suspense**:

```tsx
<Route path="/admin/*" element={
  <RequireAdmin>
    <React.Suspense fallback={<LoadingScreen text="Đang tải trang quản trị..." />}>
      <AdminDashboard />
    </React.Suspense>
  </RequireAdmin>
} />
```

### Phase 4: Lazy import cho các component lớn đã tách

Các file dưới đây đã tách nhưng vẫn import tĩnh (dòng 6715–6718):

```tsx
// TRƯỚC:
import ACPControlPanel from './components/ACPControlPanel';     // 349 KB!
import ChorusVNLanding from './components/ChorusVNLanding';     // 157 KB!
import ExploreFeatures from './components/ExploreFeatures';     // 32 KB
import HelpPage from './components/HelpPage';                   // 62 KB

// SAU:
const ACPControlPanel = React.lazy(() => import('./components/ACPControlPanel'));
const ChorusVNLanding = React.lazy(() => import('./components/ChorusVNLanding'));
const ExploreFeatures = React.lazy(() => import('./components/ExploreFeatures'));
const HelpPage = React.lazy(() => import('./components/HelpPage'));
```

> **Riêng ACPControlPanel (349 KB)**: chuyển sang lazy import sẽ giảm thêm ~349 KB cho visitors không phải master admin!

---

## 5. Cấu Trúc File Sau Refactor

```
src/
├── App.tsx                          (~16,000 dòng — giảm từ 28,260)
├── types.ts                         (đã có)
├── utils/
│   ├── shared.ts                    (NEW — shared utilities)
│   └── adminUtils.ts               (NEW — admin-only utilities)
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx       (NEW — ~11,000 dòng)
│   │   ├── AdminCreateDemo.tsx      (NEW — ~1,360 dòng)
│   │   ├── AdminEditDemo.tsx        (NEW — ~1,533 dòng)
│   │   └── AdminPlaylistEdit.tsx    (NEW — ~407 dòng)
│   ├── ACPControlPanel.tsx          (đã có — sẽ lazy import)
│   ├── ChorusVNLanding.tsx          (đã có — sẽ lazy import)
│   ├── ExploreFeatures.tsx          (đã có — sẽ lazy import)
│   ├── HelpPage.tsx                 (đã có — sẽ lazy import)
│   └── ... (các component khác)
```

---

## 6. Kết Quả Dự Kiến

### Bundle size (gzip)

| Chunk | Hiện tại | Sau refactor | Ai tải? |
|-------|----------|-------------|---------|
| `index.js` | 429 KB | ~200 KB | Tất cả visitors |
| `admin-chunk.js` | — | ~150 KB | Chỉ admin |
| `acp-chunk.js` | — | ~80 KB | Chỉ master admin |
| `landing-chunk.js` | — | ~40 KB | Chỉ chorus.vn landing |
| Vendor chunks | 57 KB | 57 KB | Tất cả |
| **Tổng public visitor** | **486 KB** | **~257 KB** | **-47%** |

### Performance impact

| Metric | Trước | Sau | Cải thiện |
|--------|-------|-----|-----------|
| JS download (4G) | ~1.4s | ~0.7s | **-50%** |
| JS download (3G) | ~5.5s | ~2.8s | **-50%** |
| JS parse (mobile) | ~800ms | ~400ms | **-50%** |
| Time to Interactive | ~3s | ~1.5s | **-50%** |
| Admin page load | 0 (đã có) | +200ms (lazy load) | Chấp nhận được |

---

## 7. Rủi Ro & Lưu Ý

### Rủi ro cao
1. **Shared state**: `AdminDashboard` nhận props từ `RequireAdmin` — cần đảm bảo props vẫn truyền đúng qua lazy boundary
2. **DemoPlayer dùng trong cả admin (preview) và public** — KHÔNG tách DemoPlayer, giữ trong bundle chính
3. **AdminFloatingControls hiện trên mọi trang khi user đã login** — KHÔNG tách, giữ trong bundle chính
4. **Translation dictionaries (~3,800 dòng)** — NÊN giữ trong bundle chính vì cả public lẫn admin đều dùng

### Rủi ro thấp
5. **Circular dependencies**: Admin components import shared utils, shared utils không import admin → OK
6. **CSS**: Tất cả CSS nằm trong `index.css`, không bị ảnh hưởng bởi JS splitting

### Quy tắc an toàn
- **KHÔNG di chuyển `DemoPlayer`** — nó được dùng ở cả public routes và admin preview
- **KHÔNG di chuyển `AdminLogin`** — nhỏ (~320 dòng) và cần sẵn sàng ngay khi user truy cập /admin
- **KHÔNG di chuyển translation dictionaries** — shared giữa tất cả components
- **KHÔNG di chuyển `AdminFloatingControls`** — render trên mọi trang khi user đã đăng nhập
- **export default** cho mỗi admin component mới (bắt buộc cho `React.lazy`)

---

## 8. Thứ Tự Thực Hiện (Step-by-step cho Agent)

```
Bước 1: Tạo src/utils/shared.ts
         → Di chuyển shared functions (getArtistLink, auth helpers, etc.)
         → Update imports trong App.tsx

Bước 2: Tạo src/utils/adminUtils.ts
         → Di chuyển admin-only functions (uploadWithProgress, compressImageToJPG)
         → Update imports trong App.tsx

Bước 3: Tạo src/components/admin/AdminDashboard.tsx
         → Di chuyển AdminDashboard + sub-components
         → Add proper imports từ shared.ts, adminUtils.ts
         → export default AdminDashboard

Bước 4: Tạo AdminCreateDemo.tsx, AdminEditDemo.tsx, AdminPlaylistEdit.tsx
         → Tương tự bước 3

Bước 5: Update AnimatedRoutes trong App.tsx
         → Thay static imports bằng React.lazy()
         → Wrap admin routes với <Suspense>

Bước 6: Lazy import cho ACPControlPanel, ChorusVNLanding, ExploreFeatures, HelpPage
         → Thay import tĩnh (dòng 6715–6718) bằng React.lazy()

Bước 7: Build & Test
         → npx vite build — verify chunks tách đúng
         → Test public pages: /, /demo/:id, /song/:id, /playlist/:id
         → Test admin pages: /admin, /admin/new, /admin/edit/:id
         → Test login flow: AdminLogin → RequireAdmin → AdminDashboard
```

---

## 9. Verification Checklist

- [ ] `npx vite build` thành công, không lỗi
- [ ] Output có nhiều chunks (index.js + admin chunk + acp chunk + landing chunk)
- [ ] `index.js` nhỏ hơn 1,000 KB (gzip < 250 KB)
- [ ] Truy cập trang public KHÔNG tải admin chunk (check Network tab)
- [ ] Truy cập /admin tải admin chunk (check Network tab)
- [ ] Login flow hoạt động: AdminLogin → Google Sign-In → redirect đúng
- [ ] AdminDashboard render đúng tất cả tabs (songs, playlists, settings)
- [ ] AdminCreateDemo: tạo bài hát mới hoạt động
- [ ] AdminEditDemo: sửa bài hát hoạt động (upload, drag & drop)
- [ ] AdminPlaylistEdit: sửa playlist hoạt động
- [ ] DemoPlayer preview trong admin settings hoạt động
- [ ] AdminFloatingControls vẫn hiện trên trang public khi đã login
- [ ] Translations hoạt động đúng ở cả admin và public

---

## 10. Tham Khảo Nhanh

- **Vite code splitting docs**: https://vite.dev/guide/build#chunking-strategy
- **React.lazy docs**: https://react.dev/reference/react/lazy
- **Current vite config**: `F:\code\git\crvn\vite.config.ts`
- **Current build output**: `F:\code\git\crvn\dist/`
- **AGENTS.md rules**: `F:\code\git\crvn\AGENTS.md` — đặc biệt quy tắc deploy và state integrity
