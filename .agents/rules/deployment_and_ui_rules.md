# CHORUS.VN System & UI Rules

- **Database Preservation**: Always run Step 0 in `deploy_chorus_now.cjs` to download live `data_*.json` and `.db` files from VPS before uploading new builds.
- **Upload Progress UI**: Single and multi-image upload progress must use square preview cards with spinning circular indicator and percentage `%` text overlay (`bg-black/40`, `border-t-emerald-400 animate-spin`).
- **YouTube Scraper**: Ensure `/api/youtube-playlist` supports `lockupViewModel` and legacy renderers.
- **Image Optimization**: Use `thumbUrl` for cards & random song widgets.
