const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== Step 1: Fetching artists list from chorus.vn ===');
  const artists = await fetchJson('https://chorus.vn/api/public/artists');
  console.log(`Found ${artists.length} artists on chorus.vn:`);
  artists.forEach(a => console.log(` - ${a.artistName} (username: ${a.username}, ext: ${a.extension})`));

  fs.writeFileSync(path.join(__dirname, 'artists.json'), JSON.stringify(artists, null, 2), 'utf-8');
  console.log('Saved updated artists.json locally.');

  console.log('\n=== Step 2: Fetching individual artist databases from chorus.vn ===');
  for (const art of artists) {
    try {
      const username = art.username;
      console.log(`Fetching data for artist ${username}...`);
      const artistData = await fetchJson(`https://chorus.vn/api/data?artist=${username}`);
      const filePath = path.join(__dirname, `data_${username}.json`);
      fs.writeFileSync(filePath, JSON.stringify(artistData, null, 2), 'utf-8');
      console.log(` Saved data_${username}.json (${fs.statSync(filePath).size} bytes)`);
    } catch (e) {
      console.error(`❌ Failed to fetch data for ${art.username}:`, e.message);
    }
  }

  console.log('\n=== Step 3: Fetching landing config if available ===');
  try {
    const landingData = await fetchJson('https://chorus.vn/api/data?artist=default');
    if (landingData) {
      console.log('Fetched landing config from chorus.vn.');
    }
  } catch (e) {
    console.log('Landing config fetch note:', e.message);
  }

  console.log('\n✅ All database files successfully fetched from chorus.vn!');
}

main().catch(err => {
  console.error('❌ Sync script failed:', err);
  process.exit(1);
});
