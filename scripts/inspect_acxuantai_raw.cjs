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
  console.log('=== Step 1: Reading local data_acxuantai.json ===');
  const localData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data_acxuantai.json'), 'utf-8'));
  console.log('Local demos count:', (localData.demos || []).length);
  console.log('Local releasedSongs count:', (localData.releasedSongs || []).length);

  console.log('\n--- Local Demos Titles & Slugs ---');
  (localData.demos || []).forEach((d, i) => {
    console.log(`${i+1}. Title: "${d.title}" | slug: "${d.slug}" | isReleased: ${d.isReleased} | isDraft: ${d.isDraft} | secretKey: ${d.secretKey}`);
  });

  console.log('\n--- Local Released Songs Titles & Slugs ---');
  (localData.releasedSongs || []).forEach((s, i) => {
    console.log(`${i+1}. Title: "${s.title}" | slug: "${s.slug}"`);
  });

  console.log('\n=== Step 2: Fetching LIVE data from https://chorus.vn/api/data?artist=acxuantai ===');
  try {
    const liveData = await fetchJson('https://chorus.vn/api/data?artist=acxuantai');
    console.log('Live demos count:', (liveData.demos || []).length);
    console.log('Live releasedSongs count:', (liveData.releasedSongs || []).length);
    console.log('\n--- Live Demos Titles ---');
    (liveData.demos || []).forEach((d, i) => {
      console.log(`${i+1}. Title: "${d.title}" | slug: "${d.slug}" | isReleased: ${d.isReleased} | secretKey: ${d.secretKey}`);
    });
  } catch (e) {
    console.error('Live fetch error:', e.message);
  }
}

main();
