# CHORUS.VN (CRVN) System Architecture & Technical Specification

> **Ghi chú quan trọng cho AI Agent:** Đây là tài liệu master chứa toàn bộ thông tin kiến trúc, cơ sở dữ liệu, lưu trữ R2 Cloudflare (`cdn.chorus.vn`), quy trình SSO đa tab, hướng dẫn chi tiết từng mục trong `/admin` và `/master`, phân cấp tài khoản Free/Pro/VIP, quản lý bài hát/vé/vouchers, phân quyền ẩn/hiện & mật khẩu bài hát, đa ngôn ngữ AI và quy trình Backup/Deploy của dự án `chorus.vn`. Đọc file này khi bắt đầu phiên làm việc để hiểu trọn vẹn 100% logic hệ thống mà không cần quét lại toàn bộ mã nguồn.

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
   - File cơ sở dữ liệu SQLite chính của hệ thống `chorus.vn` lưu trữ có cấu trúc cho hiệu năng truy xuất cao và nhất quán dữ liệu.
   - Bảng chính: `artists`, `songs`, `playlists`, `system_configs`.
2. **File JSON Local (Dự phòng tĩnh & Backup tức thì):**
   - `artists.json`: Danh sách master toàn bộ nghệ sĩ trên hệ thống `chorus.vn`.
   - `data_<username>.json`: Chi tiết profile, bài hát (demos & released), danh sách phát, cấu hình riêng của từng nghệ sĩ (ví dụ: `data_acxuantai.json`, `data_thong.json`).
   - `landing_config.json`: Cấu hình giao diện landing page chính của hệ thống `chorus.vn`.
   - `tickets.json`: Hệ thống yêu cầu hỗ trợ (Support Tickets).
   - `sent_emails.json`: Lịch sử gửi mail hệ thống.
   - `vouchers.json`: Mã giảm giá / kích hoạt.
3. **Cloud Firestore (Cloud Sync):**
   - Đồng bộ dữ liệu lên đám mây khi `cloudSyncEnabled !== false`. Nếu Firestore bị lỗi quyền hạn hoặc thiếu cấu hình, server tự động ngắt và hoạt động 100% trên SQLite + Local JSON mà không làm gián đoạn hệ thống.

---

## 2. Cloudflare R2 Storage & Xử Lý Media (`cdn.chorus.vn` & `bbb.bz`)

- **Tách biệt Bucket cho 2 Site:**
  - **Site Production (`chorus.vn` - VPS 2):** Sử dụng R2 Bucket `chorus-vn` / `chorus-cdn` (Cấu hình qua `CF_R2_BUCKET_NAME` trong `.env` trên VPS Chorus) và domain CDN `https://cdn.chorus.vn`.
  - **Site Demo / Staging (`bbb.bz` - VPS 1):** Sử dụng R2 Bucket riêng `bbb-bz` / `bbb-cdn` (Cấu hình qua `CF_R2_BUCKET_NAME` trong `.env` trên VPS Demo) để đảm bảo cô lập dữ liệu hoàn toàn giữa 2 môi trường.
- **Nạp động từ biến môi trường (`server.ts`):**
  - Server nạp trực tiếp `process.env.CF_R2_BUCKET_NAME` và `process.env.CF_R2_PUBLIC_DOMAIN` từ file `.env` của từng host, không hardcode cố định bucket, giúp 2 môi trường hoạt động độc lập tuyệt đối.
- **Cấu hình S3 Client:** Đơn vị kết nối qua Cloudflare R2 Endpoint `https://<CF_R2_ACCOUNT_ID>.r2.cloudflarestorage.com` (Sử dụng `@aws-sdk/client-s3`).
- **Quy trình Upload & Tối ưu hóa:**
  1. **Ảnh (Covers / Avatars):** Đi qua module `sharp` để nén JPEG/PNG tối ưu dung lượng trước khi tải lên Cloudflare R2.
  2. **Audio / Video:** Tải lên trực tiếp hoặc xử lý mã hóa qua `fluent-ffmpeg` / `@ffmpeg-installer/ffmpeg`.
  3. **Cơ chế Sao lưu Kép (Dual Backup):** Mọi file upload được lưu song song vào thư mục local `/uploads/<artistId>/...` và đưa lên Cloudflare R2. URL R2 (`https://cdn.chorus.vn/...`) được ưu tiên trả về client. Nếu upload R2 bị timeout (>5s) hoặc lỗi, URL local sẽ được dùng làm fallback.

---

## 3. Phân Quyền Bảo Vệ, Trạng Thái Ẩn/Hiện & Mật Khẩu Bài Hát

Hệ thống đơn giản hóa quản lý trạng thái bài hát thành **đúng 1 trạng thái Ẩn / Không công khai** và cơ chế mật khẩu chung / riêng linh hoạt:

### A. Trạng Thái Ẩn / Không Công Khai (Single Hidden State)
- Trong hệ thống `chorus.vn`, **"Ẩn / Không công khai" (`isDraft` / Ẩn bài hát)** là một trạng thái duy nhất (không phân chia rườm rà thành riêng tư hay không công khai).
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

## 4. Chi Tiết Mọi Mục Trong Trang Quản Trị Nghệ Sĩ (`/admin`)

Trang `/admin` (hoặc `<artist>.chorus.vn/admin`) là bảng điều khiển chính cho nghệ sĩ quản lý trang cá nhân của mình, bao gồm 15 mục chính:

1. **`demos` (Quản lý Bài Hát & Demos):**
   - Chứa 3 sub-tabs: *Đã phát hành (`released`)*, *Demo / Thu âm (`demos`)* và *Danh sách phát (`playlists`)*.
   - Thêm bài mới: Upload audio, tải ảnh bìa/cover, nhập tiêu đề, ca sĩ, nhạc sĩ, lời bài hát (`lyrics`).
   - Đặt trạng thái **Ẩn / Không công khai (`isDraft: true`)**: Giấu bài khỏi danh sách public, sinh đường dẫn bí mật (`secretKey` / `slug`).
   - Cài đặt **Mật khẩu riêng (`demo.password`)**: Nếu trống sẽ dùng Mật khẩu chung (`globalPassword`).
   - Sắp xếp thứ tự ưu tiên bài hát (Reorder) & Xóa bài hát (`deleted: true`).
2. **`playlists` (Quản lý Danh Sách Phát):**
   - Tạo Playlist mới, gom chọn các bài hát đi kèm.
   - Đặt tên, ảnh bìa Playlist, đặt **Mật khẩu Playlist (`playlist.password`)** hoặc tạo link bí mật (`secretLink`).
3. **`templates` (Mẫu Giao Diện Nghệ Sĩ):**
   - Lựa chọn hơn 20+ phong cách Template giao diện (Gold Luxury, Neon Club, Cyberpunk, Journal Notebook, Vintage, Ethereal, v.v.).
   - Tùy chỉnh bảng màu Lời bài hát (`lyricsColor`), Màu sóng nhạc Waveform (`waveColor`) và màu nền.
4. **`reposts` (Đăng Lại & Nhạc Liên Kết Bên Ngoài):**
   - Nhúng bài hát từ nền tảng ngoài (YouTube, Spotify, Apple Music, Zing MP3, YouTube Music).
   - Tự động bóc tách metadata và nhúng Smart Player.
5. **`profile` (Hồ Sơ Cá Nhân Nghệ Sĩ):**
   - Thay đổi Tên nghệ sĩ (`artistName`), Subdomain (`extension`), Tiêu đề trang (`pageTitle`).
   - Tải lên Ảnh đại diện Avatar (`avatarUrl`) và Ảnh bìa chính Hero Cover (`homeCoverUrl`).
   - Quản lý danh sách Slideshow hình nền động (`slideshowImages`).
   - Gắn link kênh chính (Spotify Artist URL, YouTube Playlist URL).
6. **`layout` (Cấu Hình Bố Cục Trang Web):**
   - Bật/Tắt hiển thị từng khối UI (Header, Floating Bar, Footer, Block Bài hát ra rồi, Block Demo).
   - Chỉnh chế độ Full Bleed / Xem trước giao diện PC.
7. **`about` (Giới Thiệu & Liên Hệ Booking):**
   - Soạn nội dung Giới thiệu bản thân, thông tin liên hệ làm việc, email booking, số điện thoại.
8. **`bio` (Tiểu Sử Chi Tiết & Thành Tựu):**
   - Tạo mốc thời gian sự nghiệp (Career Timeline), danh sách giải thưởng, sản phẩm nổi bật, học vấn & kinh nghiệm.
9. **`menus` (Tùy Chỉnh Thanh Điều Hướng Public Navbar):**
   - Thêm/Sửa/Xóa các nút menu trên thanh điều hướng trang công khai của nghệ sĩ.
   - Tạo liên kết tùy chỉnh dẫn sang trang ngoài hoặc tự động cuộn (smooth scroll) tới các section.
10. **`socials` (Mạng Xã Hội & Liên Kết):**
    - Cài đặt liên kết các mạng xã hội: Facebook, Instagram, TikTok, YouTube, Spotify, Soundcloud, Apple Music, Threads, X.
11. **`security` (Bảo Mật Tài Khoản & Mật Khẩu):**
    - Đổi Mật khẩu Admin (`adminPassword`) dùng truy cập `/admin`.
    - Đổi Mật khẩu Thành viên VIP (`memberPassword`) cấp cho Fan.
    - Cài đặt Mật khẩu chung (`globalPassword`) bảo vệ mặc định cho tất cả nhạc demo.
    - Cập nhật Email cá nhân, gửi yêu cầu đấu nối Tên miền riêng (`customDomain`).
12. **`tickets` (Trung Tâm Yêu Cầu Hỗ Trợ):**
    - Tạo vé yêu cầu hỗ trợ kỹ thuật gửi đến Master Admin.
    - Nhắn tin trao đổi 2 chiều realtime với Master Admin.
    - Đóng/Mở lại yêu cầu hỗ trợ.
13. **`database` (Xem Cấu Trúc Dữ Liệu - Dành cho tài khoản cấp cao):**
    - Cho phép xem nhanh cấu trúc bản ghi JSON dữ liệu của tài khoản nghệ sĩ đang đăng nhập.
14. **`admin_theme` (Chủ Đề Trang Quản Trị):**
    - Đổi giao diện Dashboard Admin (Tùy chọn phong cách Dark Glass, Gold Luxury, Minimalist Light, Midnight Purple).
15. **`vouchers` (Quy Đổi Mã Ưu Đãi):**
    - Nhập mã Voucher từ Master Admin để tăng thêm hạn mức bài đăng (`increaseSongs`), mở rộng mẫu template (`increaseTemplates`) hoặc nhận tháng VIP (`vipMonths`).

---

## 5. Chi Tiết Mọi Mục Trong Trang Master Admin (`/master` hoặc `/acp`)

Trang Master Admin (`/master` hoặc `/acp`) do Master Admin tối cao (`acxuantai`) quản lý toàn bộ nền tảng `chorus.vn`, bao gồm 11 mục chính trong `ACPControlPanel.tsx`:

1. **`artists` (Quản Lý Danh Sách Nghệ Sĩ Toàn Hệ Thống):**
   - Danh sách bảng điều khiển tất cả nghệ sĩ trên hệ thống.
   - Khóa / Kích hoạt tài khoản nghệ sĩ (`activated: true/false`).
   - Phân cấp gói cước (`roleId: 'free' | 'pro' | 'vip'`).
   - Tạo tài khoản nghệ sĩ mới, Đổi mật khẩu trực tiếp, Sửa username/subdomain.
   - Tùy chỉnh hạn mức số bài hát tối đa (`maxSongs`), giới hạn mẫu giao diện (`maxTemplates`).
   - Xóa hoàn toàn tài khoản nghệ sĩ khỏi hệ thống.
2. **`landing` (Cấu Hình Trang Chủ Hệ Thống `chorus.vn`):**
   - Chỉnh sửa nội dung Hero Section, Tiêu đề chính, Phụ đề, Nút kêu gọi hành động (CTA).
   - Tùy chỉnh ảnh Demo mockup, video giới thiệu, cài đặt SEO Meta Description & Favicon.
   - **Tính năng Dịch Tự Động AI (Translate All):** Gọi Gemini AI dịch tự động toàn bộ trang chủ sang 10+ ngôn ngữ quốc tế.
3. **`tickets` (Quản Lý Vé Hỗ Trợ Toàn Hệ Thống):**
   - Tiếp nhận tất cả Yêu cầu hỗ trợ (Support Tickets) gửi từ mọi nghệ sĩ.
   - Trả lời tin nhắn hỗ trợ realtime, Đóng/Giải quyết (`resolve`), Mở lại (`reopen`).
   - Xóa trực tiếp các bài hát hoặc dữ liệu vi phạm được đính kèm trong vé hỗ trợ.
4. **`pricing` (Cấu Hình Bảng Giá Dịch Vụ):**
   - Tùy chỉnh chi tiết mức giá và thông số các gói cước `Free`, `Pro`, `VIP`.
   - Cài đặt chu kỳ thanh toán (Tháng / Năm) và phần trăm giảm giá.
5. **`roles` (Ma Trận Phân Quyền Tính Năng - Roles Matrix):**
   - Thiết lập bảng so sánh ma trận tính năng giữa các gói Free / Pro / VIP hiển thị công khai ở trang chủ `chorus.vn`.
6. **`vouchers` (Quản Lý & Phát Hành Mã Ưu Đãi):**
   - Tạo mã Voucher mới (Cấu hình mã code, số bài tặng thêm `increaseSongs`, số mẫu giao diện tặng `increaseTemplates`, số tháng VIP `vipMonths`, phần trăm giảm giá `discountPercent`).
   - Quản lý danh sách nghệ sĩ đã sử dụng mã (`usedBy`), Xóa mã Voucher.
7. **`templates` (Quản Lý Thư Viện Mẫu Giao Diện):**
   - Quản lý các mẫu Template công khai trên hệ thống `chorus.vn`.
   - Bật/Tắt template mẫu hoặc gán quyền truy cập mẫu giao diện cho gói Pro/VIP.
8. **`faq` (Quản Lý Câu Hỏi Thường Gặp):**
   - Thêm/Sửa/Xóa các câu hỏi FAQ hiển thị trên landing page `chorus.vn`.
9. **`keywords` & `content` (SEO & Bài Viết Blog System):**
   - Quản lý từ khóa SEO toàn trang, quản lý các bài viết tin tức, bài hướng dẫn, blog trên hệ thống `chorus.vn`.
10. **`admin_theme` (Chủ Đề Giao Diện Master):**
    - Đổi giao diện hiển thị riêng cho trang quản trị tối cao Master Admin.
11. **`edit_item` (Trình Chỉnh Sửa Nâng Cao - Raw Editor):**
    - Trình can thiệp dữ liệu JSON trực tiếp dành cho Master Admin để chỉnh sửa bất kỳ bản ghi hoặc tệp dữ liệu nào trong hệ thống `chorus.vn`.

---

## 6. Phân Cấp Tài Khoản (Account Tier Hierarchy & Voucher System)

Hệ thống `chorus.vn` phân chia thành 3 cấp độ tài khoản chính với hạn mức và quyền hạn rõ ràng:

| Gói Cước (Role Tier) | Hạn Mức Bài Hát (`maxSongs`) | Quyền Tên Miền Riêng | Quyền Giao Diện | Tính Năng |
| :--- | :--- | :--- | :--- | :--- |
| **FREE** | Giới hạn (Mặc định 10 bài) | Subdomain mặc định (`<ext>.chorus.vn`) | Mẫu cơ bản | Nhạc Demo, Mật khẩu bài hát, Ticket hỗ trợ |
| **PRO** | Mở rộng hạn mức bài | Kết nối Tên miền riêng | Mở rộng mẫu Template | Đầy đủ tính năng Pro, Ưu tiên hỗ trợ |
| **VIP** | **Không giới hạn** (`-1` / `unlimited`) | **Tên miền riêng cao cấp** | **Toàn bộ Template Premium** | Tất cả tính năng cao cấp + Hỗ trợ 24/7 |

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
   - Quản lý cuộc hội thoại giữa nghệ sĩ và Quản trị viên hệ thống `chorus.vn` (Tạo vé, Gửi tin nhắn, Đóng/Giải quyết, Mở lại).
2. **Chuẩn hóa Email & Gửi Mail Chống Gian Lận (`normalizeEmail`):**
   - Loại bỏ các ký tự gian lận alias Gmail (như loại bỏ dấu `.` và phần mở rộng `+tag`).
   - Gửi mail qua Nodemailer + SMTP Brevo (`smtp-relay.brevo.com`). Lịch sử lưu tại `sent_emails.json`.

---

## 9. Động Cơ Đa Ngôn Ngữ AI (Multilingual Engine)

- Module `translate_admin.ts` kết hợp với Google Gemini AI (`@google/genai`).
- Hỗ trợ dịch tự động nội dung landing page `chorus.vn`, bài viết và template hệ thống (`/api/acp/landing-config/translate-all`, `translate-templates`).
- Quản lý ngôn ngữ ưu tiên qua `preferredLang` trong `localStorage` và `defaultLanguage` trong profile nghệ sĩ.

---

## 10. Kịch Bản Backup & Phục Hồi Dữ Liệu (Backup & Sync Scripts)

Hệ thống đi kèm bộ công cụ CLI hữu ích nằm trong thư mục `scripts/`:

1. **`scripts/migrate_json_to_sqlite.cjs`:** Chuyển đổi dữ liệu JSON sang SQLite `bbb_global.db`.
2. **`scripts/upload_db_backup_to_r2.cjs`:** Backup tự động `bbb_global.db` lên Cloudflare R2 (`backups/db/bbb_global.db`).
3. **`scripts/pull_data_from_bbb_to_local_and_chorus.cjs`:** Kéo dữ liệu backup từ VPS 1 về local và đồng bộ sang VPS 2 `chorus.vn`.
4. **`scripts/dump_all_database_records.cjs` & `read_chorus_vps_data.cjs`:** Xuất báo cáo trạng thái dữ liệu `chorus.vn`.

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
