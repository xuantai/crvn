# CHORUS.VN Development & Deployment Memory / Rules

This document outlines key rules, deployment protocols, database safety procedures, and UI design standards for the CHORUS.VN codebase.

---

## 1. 🛡️ Deployment & Database Protection Protocol

### Critical Rule: Preserving Live User Data
When users edit their profile, background slideshow, avatars, YouTube/Spotify playlist links, or ticket info live on `chorus.vn`, changes are written to the production server at `/home/chorus/htdocs/chorus.vn/` (`data_acxuantai.json`, `bbb_global.db`, `artists.json`, etc.).

### Deployment Script Protocol (`deploy_chorus_now.cjs`):
- **Step 0 (Reverse Data Sync)**: BEFORE cleaning `dist` or uploading build assets, `deploy_chorus_now.cjs` MUST pull all live `.json` and `.db` files from VPS to the local workspace.
- **Never upload stale local data**: By running Step 0 automatically, any edits made on the live site are saved locally first, eliminating the risk of rolling back user data upon deployment.

---

## 2. 🖼️ Image Upload Progress UI Design Standards

All image upload controls across the application (Avatar, Favicon, OG Image / Thumbnail, Song Cover, Slideshow) must follow the square preview card UI with circular percentage ring:

### Single Image Uploads (Avatar, Favicon, OG Image, Song Cover)
- **Container**: Square card (`w-20 h-20` or `w-24 h-24`), `rounded-2xl overflow-hidden bg-stone-900 border border-stone-400 shadow-md`.
- **Upload State (`progress > 0 && progress < 100`)**:
  - Image Preview: `opacity-60 filter blur-[1px]`.
  - Dark Overlay: `bg-black/40` with flex container centering child elements.
  - Spinner Ring: `w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin`.
  - Percentage Label: `text-xs font-black drop-shadow text-white` displaying `${progress}%`.
  - Bottom Progress Bar: `absolute bottom-0 left-0 right-0 h-1 bg-black/40` filled with `bg-gradient-to-r from-emerald-500 to-green-400`.
- **Completed State**: Clear unblurred image preview with change/delete action buttons.

### Multi-Image Uploads (Slideshow Backgrounds)
- **Individual Cards**: Selecting multiple files immediately instantiates an array item in `uploadingSlides`.
- **Parallel Progress Rendering**: Each selected file gets its own square card displaying individual `%` progress.
- **Immediate State Transition**: As each file completes uploading, its URL is pushed into `slideshowImages` and its progress card is removed seamlessly.

---

## 3. 📺 YouTube Playlist Scraper Architecture (`server.ts`)

- **Endpoint**: `/api/youtube-playlist?plId=...`
- **Supported YouTube Formats**:
  - Supports modern YouTube `lockupViewModel` structure (2026 renderer format) as well as legacy `playlistVideoRenderer` and `gridVideoRenderer`.
  - Extract video IDs, titles, thumbnails, and durations automatically.

---

## 4. 🚀 Performance & Data Integrity Standards

- **Thumbnail Optimization**: For song list items, random song cards, and grids, always prefer `song.thumbUrl || song.coverUrl` (400px optimized WebP/JPG) instead of 1200px high-res originals.
- **Slideshow Image Cleanliness**: `slideshowImages` arrays must never contain empty strings `""`. Server runtime (`server.ts` `applyBaseUrl`) automatically strips empty items.

---

## 5. 🎵 Admin Songs List, Routing & Mobile UI Standards (`/admin/songs`)

- **Main Route URL**:
  - The main route for "Kho nhạc" in `/admin` MUST strictly be `/admin/songs` (not `/admin/kho-nhac`).
  - Sub-tab navigation updates address bar cleanly: `/admin/songs/released`, `/admin/songs/demos`, `/admin/songs/brands`, `/admin/songs/drafts`, `/admin/songs/playlists`, `/admin/songs/trash`.
- **Mobile Dropdown Navigation**:
  - Main button title on mobile MUST always display `"Kho Nhạc"` (never infected by subtab names like `"bản nháp"` or `"đã ra mắt"`).
  - Hide 3-line hamburger menu icon inside dropdown button to optimize horizontal width and maximize space for long artist names.
- **Mobile Song Card 1-Row Layout & Index Badge**:
  - On mobile screens (`sm:` and smaller), song card elements (thumbnail, title/artist info, actions) MUST be arranged in 1 compact horizontal row (`flex flex-row items-center justify-between gap-2.5 p-2.5 sm:p-3`).
  - Index badges (`#1`, `#2`...) MUST be hidden on mobile (`hidden sm:flex`) to keep cards clean and compact.
- **Marquee Overflow Text Scrolling (Yoyo / Bounce)**:
  - Long song titles or artist names that exceed container width MUST use `MarqueeText` with auto overflow calculation.
  - When text overflows, it smoothly scrolls left until the end of text is visible, pauses, and reverses back to start (left-right bounce).
- **Singer & Composer Display Rules**:
  - **Mobile**: Remove `"Ca sĩ:"` text prefix label, render only the singer/artist names using `MarqueeText` (e.g. `A.C Xuân Tài, Changg`).
  - **PC View**: Display `Tác giả: [Composer] • Ca sĩ: [Singer]`.
- **Admin Active Pill Sliding Animation (`adminSidebarActiveBg` & `adminSubTabActiveBg`)**:
  - Both vertical sidebar menu pills (`layoutId="adminSidebarActiveBg"`) and horizontal subtab pills (`layoutId="adminSubTabActiveBg"`) MUST use identical spring animation parameters: `transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}`.
  - Active pill elements MUST include `style={{ transition: 'none' }}` to prevent CSS `transition: all` rules (such as from `.btn-black-gradient-blur`) from interfering with Framer Motion 60fps layout interpolation.
