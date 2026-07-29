const https = require('https');

function fetchFirebaseItems() {
  return new Promise((resolve, reject) => {
    https.get('https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const data = await fetchFirebaseItems();
  const items = data.items || [];

  const targetItems = items.filter(item => item.name.includes('sw69l6795go'));

  console.log(`=== ALL ${targetItems.length} FILES IN FIREBASE UPLOADS/sw69l6795go ===`);
  targetItems.forEach((item, idx) => {
    const encodedName = encodeURIComponent(item.name);
    const token = item.downloadTokens || '';
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o/${encodedName}?alt=media${token ? '&token=' + token : ''}`;
    console.log(`${idx + 1}. ${item.name}`);
    console.log(`   URL: ${publicUrl}`);
  });
}

main();
