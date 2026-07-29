const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('data_') && f.endsWith('.json'));
const mediaUrls = new Set();
const relativeUploads = new Set();

for (const file of files) {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
  try {
    const data = JSON.parse(content);
    
    // Check root properties
    ['homeCoverUrl', 'avatarUrl', 'faviconUrl', 'ogImageUrl'].forEach(p => {
      if (data[p] && typeof data[p] === 'string') mediaUrls.add(data[p]);
    });
    if (Array.isArray(data.slideshowImages)) {
      data.slideshowImages.forEach(img => mediaUrls.add(img));
    }

    // Check demos / songs
    const songs = [...(data.demos || []), ...(data.releasedSongs || [])];
    for (const song of songs) {
      ['audioUrl', 'backupAudioUrl', 'coverUrl', 'backgroundUrl'].forEach(p => {
        if (song[p] && typeof song[p] === 'string') mediaUrls.add(song[p]);
      });
    }
  } catch (e) {}
}

console.log(`Total unique media URLs found across all artists: ${mediaUrls.size}`);
mediaUrls.forEach(url => {
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    relativeUploads.add(url);
  }
});

console.log(`\nRelative /uploads/ URLs (${relativeUploads.size}):`);
Array.from(relativeUploads).slice(0, 30).forEach(u => console.log(' - ' + u));

console.log(`\nOther External / Firebase URLs (${mediaUrls.size - relativeUploads.size}):`);
Array.from(mediaUrls).filter(u => !u.startsWith('/uploads/') && !u.startsWith('uploads/')).slice(0, 10).forEach(u => console.log(' - ' + u));
