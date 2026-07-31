# CHORUS.VN (CRVN) System Architecture & Technical Specification

> **Ghi chú quan trọng cho AI Agent:** Đây là tài liệu master chứa toàn bộ thông tin kiến trúc, cơ sở dữ liệu, lưu trữ R2 Cloudflare, quy trình SSO đa tab, quản lý bài hát/vé/vouchers, đa ngôn ngữ AI và quy trình Backup/Deploy của dự án `chorus.vn`. Đọc file này khi bắt đầu phiên làm việc để hiểu trọn vẹn 100% logic hệ thống mà không cần quét lại toàn bộ mã nguồn.

---

## 1. Kiến Trúc Lưu Trữ Dữ Liệu 3 Lớp (Tri-Storage Model)

Hệ thống kết hợp 3 lớp lưu trữ linh hoạt với cơ chế tự động chuyển đổi dự phòng (Automatic Fallback):

```
       ┌────────────────────────────────────────────────────────┐
       │                 Frontend & Express Server               │
       └──────────────────────────┬─────────────────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌───────────────────┐
│ SQLite DB    │          │ File JSON    │          │ Cloud Firestore   │
│bbb_global.db │ ◄──────► │ Local Files  │ ◄──────► │ (Optional Cloud)  │
└──────────────┘          └──────────────┘          └───────────────────┘
```

1. **SQLite Database (`bbb_global.db`):**
   - Lưu trữ có cấu trúc cho hiệu năng truy xuất cao và nhất quán dữ liệu.
   - Bảng chính: `artists`, `songs`, `playlists`, `system_configs`.
2. **File JSON Local (Dự phòng tĩnh & Backup tức thì):**
   - `artists.json`: Danh sách master toàn bộ nghệ sĩ trên hệ thống.
   - `data_<username>.json`: Chi tiết profile, bài hát (demos & released), danh sách phát, cấu hình riêng của từng nghệ sĩ (ví dụ: `data_acxuantai.json`, `data_thong.json`).
   - `landing_config.json`: Cấu hình giao diện landing page chính của hệ thống.
   - `tickets.json`: Hệ thống yêu cầu hỗ trợ (Support Tickets).
   - `sent_emails.json`: Lịch sử gửi mail hệ thống.
   - `vouchers.json`: Mã giảm giá / kích hoạt.
3. **Cloud Firestore (Cloud Sync):**
   - Đồng bộ dữ liệu lên đám mây khi `cloudSyncEnabled !== false`. Nếu Firestore bị lỗi quyền hạn hoặc thiếu cấu hình, server tự động ngắt và hoạt động 100% trên SQLite + Local JSON mà không làm gián đoạn hệ thống.

---

## 2. Cloudflare R2 Storage & Xử Lý Media

- **Bucket:** `bbb-bz` (hoặc `CF_R2_BUCKET_NAME` từ `.env`).
- **CDN Public Domain:** `https://cdn.bbb.bz`
- **Cấu hình S3 Client:** Đơn vị kết nối qua Cloudflare R2 Endpoint `https://<CF_R2_ACCOUNT_ID>.r2.cloudflarestorage.com` (Sử dụng `@aws-sdk/client-s3`).
- **Quy trình Upload & Tối ưu hóa:**
  1. **Ảnh (Covers / Avatars):** Đi qua module `sharp` để nén JPEG/PNG tối ưu dung lượng trước khi tải lên.
  2. **Audio / Video:** Tải lên trực tiếp hoặc xử lý mã hóa qua `fluent-ffmpeg` / `@ffmpeg-installer/ffmpeg`.
  3. **Cơ chế Sao lưu Kép (Dual Backup):** Mọi file upload được lưu song song vào thư mục local `/uploads/<artistId>/...` và đưa lên Cloudflare R2. URL R2 được ưu tiên trả về client. Nếu upload R2 bị timeout (>5s) hoặc lỗi, URL local sẽ được dùng làm fallback.

---

## 3. Quản Lý Bài Hát, Profile & Nội Dung Nghệ Sĩ

### A. Cấu Trúc Dữ Liệu Bài Hát (`songs` table / JSON array):
Mỗi bài hát (Demo hoặc Released) chứa các trường dữ liệu tiêu chuẩn:
- `id`: Mã định danh duy nhất (UUID string / timestamp).
- `artist_username`: Username sở hữu bài hát.
- `title`, `singer`, `composer`, `releaseYear`: Thông tin cơ bản.
- `isReleased`: Khác biệt giữa nhạc phát hành (true) và bài thu âm/demo (false).
- `audioUrl`: Đường dẫn file nhạc chính (R2 CDN URL).
- `backupAudioUrl`: Đường dẫn nhạc dự phòng.
- `coverUrl` & `backgroundUrl`: Ảnh bìa & hình nền.
- `lyrics`: Lời bài hát.
- `slug` & `secretKey`: Đường dẫn riêng tư / link mã hóa bảo vệ.
- `status`: Trạng thái (`public`, `private`, `unlisted`).
- `password`: Cài đặt mật khẩu truy cập (nếu có).
- `isDraft`: Nháp chưa công bố.

### B. Tên Miền Riêng & Mối Liên Kết Tên Miền Con (Custom Domains & Subdomains):
- Thuộc tính `customDomain` trong profile nghệ sĩ cho phép kết nối tên miền riêng (ví dụ: `acxuantai.com`).
- `externalWebsiteUrl` & `hasExternalWebsite`: Tự động chuyển hướng khách truy cập nếu nghệ sĩ đăng ký website bên ngoài.
- Hàm `syncArtistsCustomDomains()` định kỳ quét và đồng bộ cấu hình tên miền riêng giữa Firestore, SQLite và `artists.json`.

---

## 4. Kiến Trúc SSO & Đăng Xuất Đa Tab (Single Sign-On & Single Logout)

### A. Phạm Vi Cookie Quốc Tế (`.chorus.vn`)
- Toàn bộ Cookie được ghi với thuộc tính: `Domain=.chorus.vn; Path=/; max-age=31536000; SameSite=Lax`.
- Danh sách Cookie Keys: `activeAdminExtension`, `adminToken`, `adminToken_<ext>`, `activeAdminName`, `activeAdminAvatar`, `activeAdminActivated`, `memberToken`.

### B. Nguồn Sự Thật Duy Nhất (Single Source of Truth)
- `getActiveAdminSession()` trong `src/App.tsx` kiểm tra Cookie trên `.chorus.vn`. Nếu Cookie trống/xóa, session ngay lập tức được xác định là **ĐÃ ĐĂNG XUẤT** trên toàn hệ thống và **KHÔNG** khôi phục lại từ `localStorage`.

### C. Cờ Guard Chống Hồi Sinh Session (`window.__IS_LOGGED_OUT__`)
- Khi người dùng bấm Đăng xuất, cờ `(window as any).__IS_LOGGED_OUT__ = true` được kích hoạt ngay lập tức.
- Ngăn chặn triệt để trường hợp các tab `chorus.vn` ngầm re-render và gọi `setGlobalCookie` hoặc `localStorage.setItem` làm sống lại phiên đăng nhập cũ.

### D. Đồng Bộ Realtime Đa Tab qua BroadcastChannel (`chorus_sso_channel`)
- **`LOGOUT_ALL`:** Xóa sạch cookie `.chorus.vn`, xóa `localStorage` phiên làm việc, bật cờ `__IS_LOGGED_OUT__` và bắn event `admin-session-change` để cập nhật UI tất cả các tab lập tức.
- **`LOGIN_ALL`:** Xóa cờ `__IS_LOGGED_OUT__`, đồng bộ Cookie & LocalStorage token mới sang toàn bộ các tab đang mở.

### E. Server-Side Logout Header
- Route `/api/admin/logout` và `/api/member/logout` phát HTTP Header `Set-Cookie` xóa cookie gốc tại cấp độ Domain `.chorus.vn`.

---

## 5. Hệ Thống Vé Hỗ Trợ (Tickets), Vouchers & Email

1. **Support Ticket System (`/api/acp/tickets/*` & `/api/admin/tickets/*`):**
   - Quản lý cuộc hội thoại giữa nghệ sĩ và Quản trị viên hệ thống.
   - Các chức năng: Tạo vé (`create`), Trả lời tin nhắn (`message`), Đóng/Giải quyết (`resolve`), Mở lại (`reopen`), Xóa bài hát gắn kèm (`remove-song`).
2. **Hệ Thống Voucher (`/api/acp/vouchers/*` & `/api/admin/vouchers/redeem`):**
   - Tạo mã ưu đãi kích hoạt tính năng / gia hạn tài khoản cho nghệ sĩ.
   - Lưu vết lịch sử quy đổi.
3. **Chuẩn hóa Email & Gửi Mail Chống Gian Lận (`normalizeEmail`):**
   - Loại bỏ các ký tự gian lận alias Gmail (như loại bỏ dấu `.` và phần mở rộng `+tag`).
   - Gửi mail thông báo qua Nodemailer + SMTP Brevo (`smtp-relay.brevo.com`). Lịch sử lưu tại `sent_emails.json`.

---

## 6. Động Cơ Đa Ngôn Ngữ AI (Multilingual Engine)

- Module `translate_admin.ts` kết hợp với Google Gemini AI (`@google/genai`).
- Hỗ trợ dịch tự động nội dung landing page, bài viết và template hệ thống (`/api/acp/landing-config/translate-all`, `translate-templates`).
- Quản lý ngôn ngữ ưu tiên qua `preferredLang` trong `localStorage` và `defaultLanguage` trong profile nghệ sĩ.

---

## 7. Kịch Bản Backup & Phôi Phục Dữ Liệu (Backup & Sync Scripts)

Hệ thống đi kèm bộ công cụ CLI hữu ích nằm trong thư mục `scripts/`:

1. **`scripts/migrate_json_to_sqlite.cjs`:**
   - Chuyển đổi toàn bộ dữ liệu từ các tệp JSON local sang cơ sở dữ liệu SQLite `bbb_global.db`.
2. **`scripts/upload_db_backup_to_r2.cjs`:**
   - Tự động nén và tải bản sao lưu `bbb_global.db` lên Cloudflare R2 tại đường dẫn `backups/db/bbb_global.db`.
3. **`scripts/pull_data_from_bbb_to_local_and_chorus.cjs`:**
   - Đồng bộ và kéo dữ liệu sao lưu mới nhất từ VPS 1 về máy cục bộ và đẩy sang VPS 2.
4. **`scripts/dump_all_database_records.cjs` & `read_chorus_vps_data.cjs`:**
   - Kiểm tra và xuất báo cáo trạng thái dữ liệu trên máy chủ.

---

## 8. Quy Trình Máy Chủ & Deploy (VPS Operations)

### Cấu Hình Máy Chủ:
- **VPS 1 (Demo / Primary):** IP `36.50.177.253` | PM2 Process `demonhac` | Deploy: `node deploy_now.cjs`
- **VPS 2 (Production Chorus):** IP `160.187.147.125` | PM2 Process `chorusvn` | Deploy: `node deploy_chorus_now.cjs`

### Các Lệnh Thường Dùng Khi Phát Triển:
```powershell
# 1. Biên dịch dự án
cmd /c npm run build

# 2. Commit & Push mã nguồn lên Git (Bắt buộc)
git add . ; git commit -m "Mô tả thay đổi" ; git push origin main

# 3. Deploy lên VPS 1 (Demo)
node deploy_now.cjs

# 4. Deploy lên VPS 2 (Main Chorus)
node deploy_chorus_now.cjs

# 5. Backup DB lên Cloudflare R2
node scripts/upload_db_backup_to_r2.cjs
```
