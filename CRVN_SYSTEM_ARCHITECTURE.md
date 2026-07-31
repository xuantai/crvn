# CHORUS.VN (CRVN) System Architecture & Technical Specification

> **Ghi chú quan trọng cho AI Agent:** Đây là tài liệu master chứa toàn bộ thông tin kiến trúc, cơ sở dữ liệu, lưu trữ R2 Cloudflare, quy trình SSO đa tab, quản lý trang Master Admin, phân cấp tài khoản Free/Pro/VIP, quản lý bài hát/vé/vouchers, phân quyền ẩn/hiện & mật khẩu bài hát, đa ngôn ngữ AI và quy trình Backup/Deploy của dự án `chorus.vn`. Đọc file này khi bắt đầu phiên làm việc để hiểu trọn vẹn 100% logic hệ thống mà không cần quét lại toàn bộ mã nguồn.

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

## 3. Phân Quyền Bảo Vệ, Trạng Thái Ẩn/Hiện & Mật Khẩu Bài Hát

Hệ thống đơn giản hóa quản lý trạng thái bài hát thành **đúng 1 trạng thái Ẩn / Không công khai** và cơ chế mật khẩu chung / riêng linh hoạt:

### A. Trạng Thái Ẩn / Không Công Khai (Single Hidden State)
- Trong hệ thống CRVN, **"Ẩn / Không công khai" (`isDraft` / Ẩn bài hát)** là một trạng thái duy nhất (không phân chia rườm rà thành riêng tư hay không công khai).
- Khi chọn **Ẩn / Không công khai (`isDraft: true`)**:
  - Bài hát hoặc Playlist sẽ ẩn khỏi danh sách trang chủ công khai của nghệ sĩ.
  - Khách chỉ nghe/xem được khi có đường dẫn link bí mật (`secretKey` / `slug` / link trực tiếp).
- **Phân loại Nhạc phát hành vs Demo (`isReleased`):**
  - **Bài hát đã phát hành (`isReleased: true`)**: Mặc định hiển thị công khai ở tab *Đã phát hành*, mở công khai `audioUrl`, không cần mật khẩu.
  - **Nhạc Demo / Thu âm (`isReleased: false`)**: Thuộc tab *Demo/Thu âm*, mặc định ẩn `audioUrl` đối với khách vãng lai và bắt buộc mở khóa mật khẩu.

### B. Logic Mật Khẩu Bài Hát & Playlist (Mật Khẩu Chung vs Mật Khẩu Riêng)
1. **Mật Khẩu Chung (`globalPassword`):**
   - Thiết lập một lần trong cấu hình trang cá nhân của nghệ sĩ (`data_<artist>.json`).
   - Tự động áp dụng bảo vệ cho **tất cả các bài Demo/Thu âm** mà nghệ sĩ không cài mật khẩu riêng.
2. **Mật Khẩu Riêng Bài Hát (`demo.password`):**
   - Đặt riêng cho từng bài hát cụ thể trong form chỉnh sửa bài hát.
   - Có ưu tiên cao nhất: Nếu bài có `demo.password`, hệ thống sẽ yêu cầu đúng mật khẩu này thay vì `globalPassword`.
3. **Mật Khẩu Playlist (`playlist.password` & `secretLink`):**
   - Đặt mật khẩu bảo vệ nguyên một danh sách phát.
   - Khi người dùng nhập đúng mật khẩu Playlist (hoặc truy cập qua link bí mật `secretLink`), hệ thống cấp `playlistToken` tự động mở khóa hàng loạt tất cả các bài hát con bên trong playlist đó mà không cần nhập mật khẩu từng bài.
4. **Quyền Bypass cho Admin & Thành Viên VIP (`adminPassword`, `memberPassword`):**
   - `adminPassword`: Đăng nhập trang quản trị nghệ sĩ `/admin`.
   - `memberPassword`: Mật khẩu thành viên/Fan đặc biệt. Đăng nhập xong sẽ xem/nghe toàn bộ nhạc Demo/Ẩn mà không bao giờ bị hỏi mật khẩu bài hát.

---

## 4. Quản Lý Trang Master Admin & Hệ Thống ACP (Admin Control Panel)

Trang Master Admin dành riêng cho Quản trị viên tối cao của hệ thống (`acxuantai`):

1. **Cơ Chế Xác Thực Master (`isRequestMasterAdmin`):**
   - Nhận diện quyền tối cao thông qua `masterToken` hoặc token định dạng `master_token_<adminPassword>`.
   - Tài khoản mặc định chính: Username `acxuantai` (`isSpecial: true`, `isMasterAdmin: true`).
2. **Quyền Hạn Toàn Diện của Master Panel (`/api/acp/*`):**
   - **Quản lý Tài khoản Nghệ sĩ (`/api/acp/artists/*`):** Tạo mới, chỉnh sửa thông tin, đổi mật khẩu, ngắt/bật kích hoạt (`activated: true/false`), hoặc xóa tài khoản nghệ sĩ.
   - **Phân cấp Gói cước & Hạn mức:** Thay đổi trực tiếp `roleId` (`free`, `pro`, `vip`), điều chỉnh số bài đăng tối đa (`maxSongs`), giới hạn giao diện (`maxTemplates`).
   - **Quản lý Bảng Giá & Ma Trận Tính Năng (`/api/acp/pricing`, `/api/acp/roles-matrix`):** Tùy chỉnh trực tiếp giá các gói cước và quyền hạn tương ứng hiển thị trên trang chủ `chorus.vn`.
   - **Tạo & Quản Lý Voucher (`/api/acp/vouchers/*`):** Phát hành mã ưu đãi gia hạn hoặc nâng cấp tính năng.
   - **Quản Lý Vé Hỗ Trợ Toàn Hệ Thống (`/api/acp/tickets/*`):** Tiếp nhận, trả lời tin nhắn, giải quyết hoặc mở lại yêu cầu hỗ trợ từ tất cả nghệ sĩ.
   - **Quản trị Đám mây Firestore (`/api/acp/artists/firebase-sync`, `firebase-wipe`):** Đồng bộ hoặc dọn dẹp dữ liệu đám mây khi cần.

---

## 5. Phân Cấp Tài Khoản (Account Tier Hierarchy & Voucher System)

Hệ thống phân chia thành 3 cấp độ tài khoản chính với hạn mức và quyền hạn rõ ràng:

| Gói Cước (Role Tier) | Hạn Mức Bài Hát (`maxSongs`) | Quyền Tên Miền Riêng | Quyền Giao Diện | Tính Năng |
| :--- | :--- | :--- | :--- | :--- |
| **FREE** | Giới hạn (Mặc định 10 bài) | Subdomain mặc định (`<ext>.chorus.vn`) | Mẫu cơ bản | Nhạc Demo, Mật khẩu bài hát, Ticket hỗ trợ |
| **PRO** | Mở rộng hạn mức bài | Kết nối Tên miền riêng | Mở rộng mẫu Template | Đầy đủ tính năng Pro, Ưu tiên hỗ trợ |
| **VIP** | **Không giới hạn** (`-1` / `unlimited`) | **Tên miền riêng cao cấp** | **Toàn bộ Template Premium** | Tất cả tính năng cao cấp + Hỗ trợ 24/7 |

### Cơ Chế Đổi Mã Voucher (`/api/admin/vouchers/redeem`):
Nghệ sĩ có thể nhập mã Voucher được cấp từ Master Admin để tự động mở rộng quyền hạn:
- `increaseSongs`: Tăng thêm số lượng bài hát tối đa được đăng.
- `increaseTemplates`: Mở rộng thêm số mẫu giao diện nghệ sĩ được sử dụng.
- `vipMonths`: Tự động cộng số tháng sử dụng gói VIP.
- `discountPercent`: Mã giảm giá khi nâng cấp dịch vụ.

---

## 6. Quản Lý Giao Diện & Layout (UI & Layout Management)

1. **Trang Chủ Hệ Thống (`chorus.vn`):**
   - Cấu hình qua `landing_config.json`.
   - Quản lý các block Hero, Bảng giá (Pricing Packages), Danh sách tính năng (Features), Template mẫu (Presets), FAQ và Đánh giá người dùng.
2. **Trang Cá Nhân Nghệ Sĩ (`<ext>.chorus.vn`):**
   - Đọc động từ `data_<artist>.json`:
     - Tùy chỉnh Tiêu đề (`pageTitle`), Tiểu sử (`artistBio`), Ảnh đại diện (`avatarUrl`), Ảnh bìa (`homeCoverUrl`).
     - Tùy chỉnh Slideshow hình nền (`slideshowImages`).
     - Liên kết MXH (Spotify, YouTube Playlist, Facebook, Instagram, TikTok).
3. **Widget Nổi Đồng Bộ Phiên (`UnifiedArtistSessionFloatingWidget`):**
   - Thanh công cụ nổi thông minh ở góc màn hình.
   - Cho phép nghệ sĩ nhanh chóng mở trang Admin, chuyển đổi nhanh giữa các subdomain nghệ sĩ khác nhau, xem trạng thái kích hoạt và Đăng xuất SSO toàn hệ thống.

---

## 7. Kiến Trúc SSO & Đăng Xuất Đa Tab (Single Sign-On & Single Logout)

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

## 8. Hệ Thống Vé Hỗ Trợ (Tickets) & Email System

1. **Support Ticket System (`/api/acp/tickets/*` & `/api/admin/tickets/*`):**
   - Quản lý cuộc hội thoại giữa nghệ sĩ và Quản trị viên hệ thống (Tạo vé, Gửi tin nhắn, Đóng/Giải quyết, Mở lại).
2. **Chuẩn hóa Email & Gửi Mail Chống Gian Lận (`normalizeEmail`):**
   - Loại bỏ các ký tự gian lận alias Gmail (như loại bỏ dấu `.` và phần mở rộng `+tag`).
   - Gửi mail qua Nodemailer + SMTP Brevo (`smtp-relay.brevo.com`). Lịch sử lưu tại `sent_emails.json`.

---

## 9. Động Cơ Đa Ngôn Ngữ AI (Multilingual Engine)

- Module `translate_admin.ts` kết hợp với Google Gemini AI (`@google/genai`).
- Hỗ trợ dịch tự động nội dung landing page, bài viết và template hệ thống (`/api/acp/landing-config/translate-all`, `translate-templates`).
- Quản lý ngôn ngữ ưu tiên qua `preferredLang` trong `localStorage` và `defaultLanguage` trong profile nghệ sĩ.

---

## 10. Kịch Bản Backup & Phục Hồi Dữ Liệu (Backup & Sync Scripts)

Hệ thống đi kèm bộ công cụ CLI hữu ích nằm trong thư mục `scripts/`:

1. **`scripts/migrate_json_to_sqlite.cjs`:** Chuyển đổi dữ liệu JSON sang SQLite `bbb_global.db`.
2. **`scripts/upload_db_backup_to_r2.cjs`:** Backup tự động `bbb_global.db` lên Cloudflare R2 (`backups/db/bbb_global.db`).
3. **`scripts/pull_data_from_bbb_to_local_and_chorus.cjs`:** Kéo dữ liệu backup từ VPS 1 về local và đồng bộ sang VPS 2.
4. **`scripts/dump_all_database_records.cjs` & `read_chorus_vps_data.cjs`:** Xuất báo cáo trạng thái dữ liệu.

---

## 11. Quy Trình Máy Chủ & Deploy (VPS Operations)

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
