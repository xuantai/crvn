const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bbb_global.db');
const db = new sqlite3.Database(dbPath);

function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  const artists = await queryAll('SELECT username, artistName, extension, pageTitle FROM artists');
  const songs = await queryAll('SELECT id, artist_username, title, singer, isReleased, releaseYear, slug FROM songs ORDER BY artist_username, releaseYear DESC');

  console.log(JSON.stringify({ artists, songs }, null, 2));
  db.close();
}

main().catch(err => {
  console.error(err);
  db.close();
});
