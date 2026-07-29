const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'bbb_global.db');
const db = new sqlite3.Database(dbPath);

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function main() {
  console.log('=== Step 1: Initializing SQLite Schema in bbb_global.db ===');

  await runSql(`
    CREATE TABLE IF NOT EXISTS artists (
      username TEXT PRIMARY KEY,
      extension TEXT NOT NULL,
      artistName TEXT,
      pageTitle TEXT,
      artistBio TEXT,
      customDomain TEXT,
      externalWebsiteUrl TEXT,
      homeCoverUrl TEXT,
      avatarUrl TEXT,
      spotifyUrl TEXT,
      youtubePlaylistUrl TEXT,
      verified INTEGER DEFAULT 1,
      isPublic INTEGER DEFAULT 1,
      data_json TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      artist_username TEXT NOT NULL,
      title TEXT NOT NULL,
      singer TEXT,
      composer TEXT,
      releaseYear TEXT,
      isReleased INTEGER DEFAULT 0,
      audioUrl TEXT,
      backupAudioUrl TEXT,
      coverUrl TEXT,
      backgroundUrl TEXT,
      lyrics TEXT,
      slug TEXT,
      secretKey TEXT,
      status TEXT DEFAULT 'public',
      password INTEGER DEFAULT 0,
      isDraft INTEGER DEFAULT 0,
      song_json TEXT,
      created_at INTEGER
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      artist_username TEXT NOT NULL,
      title TEXT NOT NULL,
      coverUrl TEXT,
      password INTEGER DEFAULT 0,
      playlist_json TEXT
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS system_configs (
      config_key TEXT PRIMARY KEY,
      config_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Schema tables created successfully.');
  await runSql('DELETE FROM artists;');
  await runSql('DELETE FROM songs;');
  await runSql('DELETE FROM playlists;');

  console.log('\n=== Step 2: Migrating artists.json into artists table ===');
  const artistsFile = path.join(__dirname, 'artists.json');
  if (fs.existsSync(artistsFile)) {
    const artistsData = JSON.parse(fs.readFileSync(artistsFile, 'utf-8'));
    for (const art of artistsData) {
      await runSql(`
        INSERT OR REPLACE INTO artists 
        (username, extension, artistName, pageTitle, artistBio, customDomain, externalWebsiteUrl, homeCoverUrl, avatarUrl, spotifyUrl, youtubePlaylistUrl, verified, isPublic, data_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        art.username,
        art.extension,
        art.artistName || '',
        art.pageTitle || '',
        art.artistBio || '',
        art.customDomain || '',
        art.externalWebsiteUrl || '',
        art.homeCoverUrl || '',
        art.avatarUrl || '',
        art.spotifyUrl || '',
        art.youtubePlaylistUrl || '',
        art.verified ? 1 : 0,
        art.isPublic !== false ? 1 : 0,
        JSON.stringify(art)
      ]);
    }
    console.log(`Migrated ${artistsData.length} artists into SQLite Database.`);
  }

  console.log('\n=== Step 3: Migrating individual artist data_*.json into Database ===');
  const files = fs.readdirSync(__dirname).filter(f => f.startsWith('data_') && f.endsWith('.json'));
  let totalSongs = 0;
  let totalPlaylists = 0;

  for (const file of files) {
    const username = file.replace('data_', '').replace('.json', '');
    const filePath = path.join(__dirname, file);
    try {
      const artData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Update artist record with detailed artData JSON
      await runSql(`
        UPDATE artists SET data_json = ? WHERE username = ?
      `, [JSON.stringify(artData), username]);

      // Migrate songs / demos
      const songs = [...(artData.demos || []), ...(artData.releasedSongs || [])];
      for (const song of songs) {
        if (!song.id) continue;
        await runSql(`
          INSERT OR REPLACE INTO songs
          (id, artist_username, title, singer, composer, releaseYear, isReleased, audioUrl, backupAudioUrl, coverUrl, backgroundUrl, lyrics, slug, secretKey, status, password, isDraft, song_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          String(song.id),
          username,
          song.title || '',
          song.singer || '',
          song.composer || '',
          song.releaseYear || '',
          song.isReleased ? 1 : 0,
          song.audioUrl || '',
          song.backupAudioUrl || '',
          song.coverUrl || '',
          song.backgroundUrl || '',
          song.lyrics || '',
          song.slug || '',
          song.secretKey || '',
          song.status || 'public',
          song.password ? 1 : 0,
          song.isDraft ? 1 : 0,
          JSON.stringify(song),
          song.createdAt || Date.now()
        ]);
        totalSongs++;
      }

      // Migrate playlists
      if (Array.isArray(artData.playlists)) {
        for (const pl of artData.playlists) {
          if (!pl.id) continue;
          await runSql(`
            INSERT OR REPLACE INTO playlists
            (id, artist_username, title, coverUrl, password, playlist_json)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            String(pl.id),
            username,
            pl.title || '',
            pl.coverUrl || '',
            pl.password ? 1 : 0,
            JSON.stringify(pl)
          ]);
          totalPlaylists++;
        }
      }
    } catch (e) {
      console.error(`Error migrating ${file}:`, e.message);
    }
  }

  console.log(`Migrated total ${totalSongs} songs/demos and ${totalPlaylists} playlists into SQLite.`);

  console.log('\n=== Step 4: Migrating System Configs ===');
  const configFiles = ['landing_config.json', 'tickets.json', 'sent_emails.json'];
  for (const cfgFile of configFiles) {
    const cfgPath = path.join(__dirname, cfgFile);
    if (fs.existsSync(cfgPath)) {
      const content = fs.readFileSync(cfgPath, 'utf-8');
      await runSql(`
        INSERT OR REPLACE INTO system_configs (config_key, config_value) VALUES (?, ?)
      `, [cfgFile.replace('.json', ''), content]);
    }
  }

  console.log('Migrated system configurations into system_configs table.');
  console.log('\n✅ SQLite Migration finished successfully! Database file: bbb_global.db');
  db.close();
}

main().catch(err => {
  console.error('Migration error:', err);
  db.close();
  process.exit(1);
});
