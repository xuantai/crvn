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

  console.log('=== FIREBASE STORAGE OVERVIEW ===');
  console.log('Total files in Firebase Storage:', items.length);

  const images = [];
  const audio = [];
  const others = [];

  items.forEach(item => {
    const name = item.name.toLowerCase();
    const isImage = name.endsWith('.webp') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif');
    const isAudio = name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a');

    // Build public Firebase Storage URL
    const encodedName = encodeURIComponent(item.name);
    const token = item.downloadTokens || '';
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o/${encodedName}?alt=media${token ? '&token=' + token : ''}`;

    const info = {
      name: item.name,
      size: parseInt(item.size || '0', 10),
      contentType: item.contentType,
      timeCreated: item.timeCreated,
      publicUrl
    };

    if (isImage) images.push(info);
    else if (isAudio) audio.push(info);
    else others.push(info);
  });

  console.log('\n=== FILE TYPES BREAKDOWN ===');
  console.log(`- Images: ${images.length} files`);
  console.log(`- Audio (.mp3): ${audio.length} files`);
  console.log(`- Others: ${others.length} files`);

  const totalImageBytes = images.reduce((a, b) => a + b.size, 0);
  console.log(`- Total Images Size: ${(totalImageBytes / (1024 * 1024)).toFixed(2)} MB`);

  console.log('\n=== SAMPLE IMAGES IN FIREBASE STORAGE ===');
  images.slice(0, 15).forEach((img, idx) => {
    console.log(`${idx + 1}. [${img.name}] (${(img.size / 1024).toFixed(1)} KB)`);
    console.log(`   URL: ${img.publicUrl}`);
  });
}

main();
