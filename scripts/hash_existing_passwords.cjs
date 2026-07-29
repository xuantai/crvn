const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function isBcryptHash(str) {
  return typeof str === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

function hashIfNeeded(pass) {
  if (!pass || typeof pass !== 'string' || isBcryptHash(pass) || pass === 'true' || pass === 'false') {
    return pass;
  }
  return bcrypt.hashSync(pass, 10);
}

function main() {
  console.log('=== Step 1: Hashing passwords in artists.json ===');
  const artistsPath = path.join(__dirname, 'artists.json');
  if (fs.existsSync(artistsPath)) {
    const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf-8'));
    for (const art of artists) {
      if (art.password) {
        art.password = hashIfNeeded(art.password);
      }
    }
    fs.writeFileSync(artistsPath, JSON.stringify(artists, null, 2), 'utf-8');
    console.log('Hashed passwords in artists.json');
  }

  console.log('\n=== Step 2: Hashing passwords in all data_*.json files ===');
  const files = fs.readdirSync(__dirname).filter(f => f.startsWith('data_') && f.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let modified = false;

      if (data.adminPassword) {
        const hashed = hashIfNeeded(data.adminPassword);
        if (hashed !== data.adminPassword) {
          console.log(`Hashing adminPassword for ${file}...`);
          data.adminPassword = hashed;
          modified = true;
        }
      }

      if (data.globalPassword) {
        const hashed = hashIfNeeded(data.globalPassword);
        if (hashed !== data.globalPassword) {
          console.log(`Hashing globalPassword for ${file}...`);
          data.globalPassword = hashed;
          modified = true;
        }
      }

      if (Array.isArray(data.demos)) {
        for (const demo of data.demos) {
          if (typeof demo.password === 'string' && demo.password !== 'true' && demo.password !== 'false') {
            const hashed = hashIfNeeded(demo.password);
            if (hashed !== demo.password) {
              console.log(`Hashing password for demo "${demo.title}" in ${file}...`);
              demo.password = hashed;
              modified = true;
            }
          }
        }
      }

      if (Array.isArray(data.playlists)) {
        for (const pl of data.playlists) {
          if (typeof pl.password === 'string' && pl.password !== 'true' && pl.password !== 'false') {
            const hashed = hashIfNeeded(pl.password);
            if (hashed !== pl.password) {
              console.log(`Hashing password for playlist "${pl.title}" in ${file}...`);
              pl.password = hashed;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Saved hashed passwords for ${file}`);
      }
    } catch (e) {
      console.error(`Error hashing passwords for ${file}:`, e.message);
    }
  }

  console.log('\n✅ All passwords successfully hashed using Bcrypt!');
}

main();
