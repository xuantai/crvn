const https = require('https');

// We can query Firestore REST API
function fetchFirestoreCollection(collection) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/taimusic-96289/databases/(default)/documents/${collection}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== FETCHING FIRESTORE APP_DATA COLLECTION ===');
  const res = await fetchFirestoreCollection('app_data');
  const docs = res.documents || [];
  console.log(`Found ${docs.length} documents in app_data:`);
  docs.forEach(doc => {
    console.log('  -', doc.name);
  });
}

main();
