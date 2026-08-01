import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all API endpoints
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// Handle OPTIONS preflight requests
app.options('*', (c) => c.text('', 200));

// 1. GET /api/health
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', provider: 'cloudflare-serverless', timestamp: Date.now() });
});

// 2. GET /api/songs
app.get('/api/songs', async (c) => {
  try {
    const artist = c.req.query('artist');
    let query = 'SELECT * FROM songs';
    let params: any[] = [];

    if (artist) {
      query += ' WHERE LOWER(artist_username) = LOWER(?) OR LOWER(id) = LOWER(?)';
      params.push(artist, artist);
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Parse JSON strings back to objects
    const parsedSongs = (results || []).map((song: any) => {
      let playlistIds = [];
      let achievements = [];
      try { if (song.playlistIds) playlistIds = JSON.parse(song.playlistIds); } catch (e) {}
      try { if (song.achievements) achievements = JSON.parse(song.achievements); } catch (e) {}

      return {
        ...song,
        isDraft: Boolean(song.isDraft),
        isReleased: Boolean(song.isReleased),
        playlistIds,
        achievements
      };
    });

    return c.json({ success: true, songs: parsedSongs });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. GET /api/song/:id
app.get('/api/song/:id', async (c) => {
  try {
    const songId = c.req.param('id');
    const song: any = await c.env.DB.prepare('SELECT * FROM songs WHERE id = ? OR slug = ?').bind(songId, songId).first();

    if (!song) {
      return c.json({ success: false, message: 'Song not found' }, 404);
    }

    let playlistIds = [];
    let achievements = [];
    try { if (song.playlistIds) playlistIds = JSON.parse(song.playlistIds); } catch (e) {}
    try { if (song.achievements) achievements = JSON.parse(song.achievements); } catch (e) {}

    return c.json({
      success: true,
      song: {
        ...song,
        isDraft: Boolean(song.isDraft),
        isReleased: Boolean(song.isReleased),
        playlistIds,
        achievements
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. POST /api/save-song
app.post('/api/save-song', async (c) => {
  try {
    const body = await c.req.json();
    const {
      id, title, slug, singer, composer, lyrics, coverUrl, audioUrl, backupAudioUrl,
      backgroundUrl, releaseYear, template, status, secretKey, artist_username,
      isDraft, isReleased, password, linkYoutube, linkSpotify, linkApple,
      linkYoutubeMusic, linkDrive, playlistIds, achievements
    } = body;

    const songId = id || String(Date.now());
    const playlistIdsStr = Array.isArray(playlistIds) ? JSON.stringify(playlistIds) : (playlistIds || '[]');
    const achievementsStr = Array.isArray(achievements) ? JSON.stringify(achievements) : (achievements || '[]');

    await c.env.DB.prepare(`
      INSERT INTO songs (
        id, title, slug, singer, composer, lyrics, coverUrl, audioUrl, backupAudioUrl,
        backgroundUrl, releaseYear, template, status, secretKey, artist_username,
        isDraft, isReleased, password, linkYoutube, linkSpotify, linkApple,
        linkYoutubeMusic, linkDrive, playlistIds, achievements, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, slug=excluded.slug, singer=excluded.singer, composer=excluded.composer,
        lyrics=excluded.lyrics, coverUrl=excluded.coverUrl, audioUrl=excluded.audioUrl,
        backupAudioUrl=excluded.backupAudioUrl, backgroundUrl=excluded.backgroundUrl,
        releaseYear=excluded.releaseYear, template=excluded.template, status=excluded.status,
        secretKey=excluded.secretKey, artist_username=excluded.artist_username,
        isDraft=excluded.isDraft, isReleased=excluded.isReleased, password=excluded.password,
        linkYoutube=excluded.linkYoutube, linkSpotify=excluded.linkSpotify, linkApple=excluded.linkApple,
        linkYoutubeMusic=excluded.linkYoutubeMusic, linkDrive=excluded.linkDrive,
        playlistIds=excluded.playlistIds, achievements=excluded.achievements
    `).bind(
      songId, title || '', slug || '', singer || '', composer || '', lyrics || '',
      coverUrl || '', audioUrl || '', backupAudioUrl || '', backgroundUrl || '',
      releaseYear || '', template || '1', status || 'public', secretKey || '', artist_username || 'system',
      isDraft ? 1 : 0, isReleased !== false ? 1 : 0, password || '',
      linkYoutube || '', linkSpotify || '', linkApple || '', linkYoutubeMusic || '',
      linkDrive || '', playlistIdsStr, achievementsStr, Date.now()
    ).run();

    return c.json({ success: true, id: songId, message: 'Song saved to Cloudflare D1' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export const onRequest = handle(app);
