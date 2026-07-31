# CHORUS.VN (CRVN) System Architecture & Technical Specification

> **Ghi chú cho AI Agent:** Đây là tài liệu tổng hợp toàn bộ kiến trúc, logic SSO, luồng dữ liệu, quy trình build & deploy của dự án `chorus.vn`. Hãy đọc file này ở đầu mỗi phiên làm việc để nắm lại toàn bộ bối cảnh dự án một cách nhanh chóng mà không cần quét lại toàn bộ file nguồn.

---

## 1. Tổng Quan Hệ Thống (System Overview)

- **Loại hình ứng dụng:** Đa tên miền con (Multi-tenant Platform) cho nghệ sĩ và quản trị viên âm nhạc.
- **Tên miền chính:** `chorus.vn` (Trang chủ hệ thống / Tổng quan admin).
- **Tên miền con nghệ sĩ (Artist Subdomains):** `<ext>.chorus.vn` (Ví dụ: `thong.chorus.vn`, `acxuantai.chorus.vn`, `lowg.chorus.vn`).
- **Frontend Stack:** React 18, TypeScript, Vite, Vanilla CSS.
- **Backend Stack:** Node.js, Express, esbuild (bundle thành `dist/server.cjs`).
- **Database:** SQLite (`bbb_global.db`) kết hợp lưu dự phòng JSON (`artists.json`, `data_<ext>.json`).
- **Repository Git:** `https://github.com/xuantai/crvn.git` (nhánh `main`).

---

## 2. Máy Chủ & Cấu Hình Deploy (VPS Infrastructure)

Hệ thống được triển khai trên 2 máy chủ VPS chạy PM2:

1. **VPS 1 (Primary / Demo VPS):**
   - **IP:** `36.50.177.253`
   - **PM2 Process:** `demonhac`
   - **Script Deploy:** `node deploy_now.cjs`

2. **VPS 2 (Production / Main Chorus VPS):**
   - **IP:** `160.187.147.125`
   - **PM2 Process:** `chorusvn`
   - **Script Deploy:** `node deploy_chorus_now.cjs`

### Quy Trình Deploy Bắt Buộc:
1. Build giao diện và server: `cmd /c npm run build`
2. Commit & Push Git: `git add . ; git commit -m "..." ; git push origin main`
3. Deploy VPS 1: `node deploy_now.cjs`
4. Deploy VPS 2: `node deploy_chorus_now.cjs`

---

## 3. Kiến Trúc SSO & Đăng Xuất Đa Tab (Single Sign-On & Multi-Tab Logout)

### A. Phạm Vi Cookie Quốc Tế (`.chorus.vn`)
Toàn bộ cookie phiên làm việc được lưu với cấu hình:
- `Domain=.chorus.vn; Path=/; max-age=31536000; SameSite=Lax`
- Danh sách key quản lý session:
  - `activeAdminExtension`: Extension nghệ sĩ đang active (e.g. `acxuantai`, `thong`).
  - `adminToken`: Token quản trị chính.
  - `adminToken_<ext>`: Token cho từng nghệ sĩ cụ thể.
  - `activeAdminName`: Tên hiển thị của nghệ sĩ.
  - `activeAdminAvatar`: Ảnh đại diện của nghệ sĩ.
  - `activeAdminActivated`: Trạng thái kích hoạt tài khoản (`true`/`false`).
  - `memberToken`: Token thành viên/khán giả.

### B. Single Source of Truth (Nguồn Sự Thật Duy Nhất)
- Trên tất cả các tên miền `.chorus.vn` và subdomain con: `getActiveAdminSession()` trong `src/App.tsx` lấy Cookie làm **Nguồn sự thật duy nhất**.
- Nếu Cookie trên `.chorus.vn` bị xóa / rỗng, hệ thống sẽ xác định ngay lập tức là **ĐÃ ĐĂNG XUẤT** và **KHÔNG BÂY GIỜ** rơi về lấy từ `localStorage` để hồi sinh session cũ.

### C. Cờ Guard Chống Hồi Sinh Session (`window.__IS_LOGGED_OUT__`)
- Khi một tab thực hiện Đăng xuất (hoặc nhận event `LOGOUT_ALL`), hệ thống gắn ngay cờ:
  ```js
  (window as any).__IS_LOGGED_OUT__ = true;
  ```
- Cờ này chủ động chặn các hàm sau thực thi nếu đang ở trạng thái logged out:
  - `setGlobalCookie()` -> Trả về ngay, không ghi cookie mới.
  - `localStorage.setItem()` (đã patch) -> Chặn ghi các key liên quan đến `adminToken`, `activeAdmin`, `memberToken`.
  - `getActiveAdminSession()`, `getAdminToken()`, `getMemberToken()` -> Trả về nulled session / rỗng.

### D. Đồng Bộ Realtime Đa Tab (`BroadcastChannel` - `chorus_sso_channel`)
Tất cả các tab trình duyệt cùng mở tên miền `.chorus.vn` được kết nối qua `BroadcastChannel('chorus_sso_channel')`:
1. **Event `LOGOUT_ALL`:**
   - Được phát khi gọi `clearAllSessions()`.
   - Tất cả các tab nhận event sẽ:
     1. Gắn cờ `window.__IS_LOGGED_OUT__ = true`.
     2. Xóa sạch `localStorage` liên quan tới token/session.
     3. Xóa toàn bộ Cookie `.chorus.vn`.
     4. Bắn sự kiện DOM `admin-session-change` và `storage` để React re-render giao diện đăng xuất tức thì.
2. **Event `LOGIN_ALL`:**
   - Được phát khi gọi `syncLoginSession()`.
   - Tất cả các tab nhận event sẽ:
     1. Xóa cờ `delete window.__IS_LOGGED_OUT__`.
     2. Ghi nhận `adminToken` và `activeAdminExtension` mới vào Cookie và LocalStorage.
     3. Bắn sự kiện `admin-session-change` để đồng bộ trạng thái đăng nhập mới.

### E. Server-Side Logout Header
Khi gọi `/api/admin/logout` hoặc `/api/member/logout` trong `server.ts`:
- Server phát các header HTTP `Set-Cookie` với cấu hình hủy cookie:
  `Domain=.chorus.vn; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`

---

## 4. Định Tuyến & Patch Fetch Đa Tên Miền (Multi-Tenant Routing)

- Hàm `getArtistExtensionFromUrl()` xác định nghệ sĩ dựa trên:
  - Hostname (vd: `thong.chorus.vn` -> ext: `thong`).
  - Path URL (vd: `chorus.vn/thong` -> ext: `thong`).
- Core Fetch (`customFetch` trong `src/App.tsx`):
  - Tự động gắn thêm header `x-artist-extension: <ext>` và query parameter `?artist=<ext>` vào mọi request gửi tới `/api/*` để backend `server.ts` xử lý đúng không gian dữ liệu của nghệ sĩ đó.

---

## 5. Danh Sách Tệp Nguồn Trọng Yếu (Key Source Files)

1. `src/App.tsx`:
   - Chứa toàn bộ giao diện chính, Router, Floating Widget session, SSO Session Manager (`getActiveAdminSession`, `clearAllSessions`, `syncLoginSession`, BroadcastChannel, `localStorage` patch).
2. `server.ts`:
   - Backend Express API, kết nối SQLite `bbb_global.db`, xử lý xác thực admin `/api/verify-admin-session`, `/api/admin/login`, `/api/admin/logout`.
3. `deploy_now.cjs`:
   - Script Deploy tự động qua SSH lên VPS 1 (`36.50.177.253`).
4. `deploy_chorus_now.cjs`:
   - Script Deploy tự động qua SSH lên VPS 2 (`160.187.147.125`).

---

## 6. Quy Trình Kiểm Tra Nhanh (Quick Verification Checklist)

- [ ] Chạy `cmd /c npm run build` không có lỗi TypeScript / Vite / esbuild.
- [ ] Mở 2 tab: `chorus.vn` và `thong.chorus.vn`.
- [ ] Bấm Đăng xuất ở tab `thong.chorus.vn` -> Cả 2 tab đều lập tức chuyển sang trạng thái Đăng xuất.
- [ ] Refresh F5 ở tab `chorus.vn` -> Giữ nguyên trạng thái Đăng xuất (không bị tự động khôi phục).
- [ ] Đăng nhập tài khoản mới -> Cả 2 tab đồng bộ tài khoản mới thành công.
