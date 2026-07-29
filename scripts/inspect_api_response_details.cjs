const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== FETCHING ACXUANTAI.CHORUS.VN/API/DATA ===');
  const d1 = await fetchJson('https://acxuantai.chorus.vn/api/data');
  console.log('Keys on chorus.vn:', Object.keys(d1));
  console.log('aboutMe:', d1.aboutMe);
  console.log('biography:', d1.biography);
  console.log('artistBio:', d1.artistBio);
  console.log('menus:', d1.menus);

  console.log('\n=== FETCHING ACXUANTAI.BBB.BZ/API/DATA ===');
  const d2 = await fetchJson('https://acxuantai.bbb.bz/api/data');
  console.log('Keys on bbb.bz:', Object.keys(d2));
  console.log('aboutMe:', d2.aboutMe);
  console.log('biography:', d2.biography);
  console.log('artistBio:', d2.artistBio);
  console.log('menus:', d2.menus);
}

run();
