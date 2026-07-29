const apiKey = "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0";
const bucket = "taimusic-96289.firebasestorage.app";

async function listStorageFiles() {
  console.log('=== LISTING ALL FILES IN FIREBASE CLOUD STORAGE ===');
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Storage REST status: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      console.log(`✅ Total Storage Items: ${data.items.length}\n`);
      const mp3s = [];
      const images = [];
      const others = [];

      data.items.forEach(item => {
        const name = item.name;
        const size = item.size;
        const contentType = item.contentType || '';
        const updated = item.updated || '';
        const info = { name, size: (size / (1024 * 1024)).toFixed(2) + ' MB', contentType, updated };
        
        if (name.endsWith('.mp3') || contentType.includes('audio')) {
          mp3s.push(info);
        } else if (name.endsWith('.webp') || name.endsWith('.jpg') || name.endsWith('.png') || contentType.includes('image')) {
          images.push(info);
        } else {
          others.push(info);
        }
      });

      console.log('=== 🎵 MP3 AUDIO FILES (' + mp3s.length + ') ===');
      mp3s.slice(0, 20).forEach(f => console.log(` - ${f.name} (${f.size})`));

      console.log('\n=== 🖼️ IMAGE FILES (' + images.length + ') ===');
      images.slice(0, 20).forEach(f => console.log(` - ${f.name} (${f.size})`));

      if (others.length > 0) {
        console.log('\n=== 📄 OTHER FILES (' + others.length + ') ===');
        others.forEach(f => console.log(` - ${f.name} (${f.size})`));
      }
    } else {
      console.log('Storage is empty');
    }
  } catch (e) {
    console.log('Error listing storage:', e.message);
  }
}

listStorageFiles();
