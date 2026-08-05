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
