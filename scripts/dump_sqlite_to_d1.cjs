const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '..', 'bbb_global.db');
const sqlPath = path.join(__dirname, '..', 'scratch', 'd1_init.sql');

if (!fs.existsSync(dbPath)) {
  console.error("bbb_global.db does not exist!");
  process.exit(1);
}

fs.mkdirSync(path.dirname(sqlPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

async function main() {
  console.log("=== EXPORTING SQLITE TO CLOUDFLARE D1 SQL ===");
  let sqlStatements = [];

  // Table schemas
  sqlStatements.push(`
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT,
  slug TEXT,
  singer TEXT,
  composer TEXT,
  lyrics TEXT,
  coverUrl TEXT,
  audioUrl TEXT,
  backupAudioUrl TEXT,
  backgroundUrl TEXT,
  releaseYear TEXT,
  template TEXT,
  status TEXT,
  secretKey TEXT,
  artist_username TEXT,
  isDraft INTEGER DEFAULT 0,
  isReleased INTEGER DEFAULT 1,
  password TEXT,
  linkYoutube TEXT,
  linkSpotify TEXT,
  linkApple TEXT,
  linkYoutubeMusic TEXT,
  linkDrive TEXT,
  playlistIds TEXT,
  achievements TEXT,
  createdAt INTEGER
);
`);

  const songs = await new Promise((res, rej) => db.all("SELECT * FROM songs", (e, r) => e ? rej(e) : res(r)));
  console.log(`Exporting ${songs.length} songs...`);

  for (const s of songs) {
    const esc = (val) => val === null || val === undefined ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`;
    sqlStatements.push(`INSERT OR REPLACE INTO songs (id, title, slug, singer, composer, lyrics, coverUrl, audioUrl, backupAudioUrl, backgroundUrl, releaseYear, template, status, secretKey, artist_username, isDraft, isReleased, password, linkYoutube, linkSpotify, linkApple, linkYoutubeMusic, linkDrive, playlistIds, achievements, createdAt) VALUES (${esc(s.id)}, ${esc(s.title)}, ${esc(s.slug)}, ${esc(s.singer)}, ${esc(s.composer)}, ${esc(s.lyrics)}, ${esc(s.coverUrl)}, ${esc(s.audioUrl)}, ${esc(s.backupAudioUrl)}, ${esc(s.backgroundUrl)}, ${esc(s.releaseYear)}, ${esc(s.template)}, ${esc(s.status)}, ${esc(s.secretKey)}, ${esc(s.artist_username)}, ${s.isDraft ? 1 : 0}, ${s.isReleased ? 1 : 0}, ${esc(s.password)}, ${esc(s.linkYoutube)}, ${esc(s.linkSpotify)}, ${esc(s.linkApple)}, ${esc(s.linkYoutubeMusic)}, ${esc(s.linkDrive)}, ${esc(s.playlistIds)}, ${esc(s.achievements)}, ${s.createdAt || Date.now()});`);
  }

  fs.writeFileSync(sqlPath, sqlStatements.join('\n\n'), 'utf-8');
  console.log(`✅ Saved D1 SQL file to ${sqlPath}`);

  console.log("\n=== POPULATING CLOUDFLARE D1 DATABASE (bbb-db) ===");
  const token = process.env.CLOUDFLARE_API_TOKEN || '';
  execSync(`cmd /c "set CLOUDFLARE_API_TOKEN=${token}&& npx wrangler d1 execute bbb-db --remote --file=./scratch/d1_init.sql"`, { stdio: 'inherit' });

  db.close();
  console.log("\n🎉 D1 DATABASE SUCCESSFULLY POPULATED!");
}

main().catch(console.error);
