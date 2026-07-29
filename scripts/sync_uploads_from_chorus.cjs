const fs = require('fs');
const path = require('path');
const https = require('https');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      console.log(`  Already exists: ${path.relative(__dirname, destPath)}`);
      return resolve();
    }

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`Status code ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error('Timeout after 10s'));
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('=== Step 1: Scanning relative /uploads/ files from artist databases ===');
  const files = fs.readdirSync(__dirname).filter(f => f.startsWith('data_') && f.endsWith('.json'));
  const relativeUploads = new Set();

  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
    try {
      const data = JSON.parse(content);
      ['homeCoverUrl', 'avatarUrl', 'faviconUrl', 'ogImageUrl'].forEach(p => {
        if (data[p] && typeof data[p] === 'string' && data[p].includes('/uploads/')) {
          const match = data[p].match(/\/uploads\/.+/);
          if (match) relativeUploads.add(match[0]);
        }
      });
      if (Array.isArray(data.slideshowImages)) {
        data.slideshowImages.forEach(img => {
          if (typeof img === 'string' && img.includes('/uploads/')) {
            const match = img.match(/\/uploads\/.+/);
            if (match) relativeUploads.add(match[0]);
          }
        });
      }
      const songs = [...(data.demos || []), ...(data.releasedSongs || [])];
      for (const song of songs) {
        ['audioUrl', 'backupAudioUrl', 'coverUrl', 'backgroundUrl'].forEach(p => {
          if (song[p] && typeof song[p] === 'string' && song[p].includes('/uploads/')) {
            const match = song[p].match(/\/uploads\/.+/);
            if (match) relativeUploads.add(match[0]);
          }
        });
      }
    } catch (e) {}
  }

  console.log(`Found ${relativeUploads.size} relative upload files to download from chorus.vn:`);

  let count = 0;
  for (const relPath of relativeUploads) {
    const cleanRelPath = relPath.startsWith('/') ? relPath.substring(1) : relPath;
    const downloadUrl = `https://chorus.vn/${cleanRelPath}`;
    const localDest = path.join(__dirname, cleanRelPath);

    try {
      console.log(`[${++count}/${relativeUploads.size}] Downloading: ${cleanRelPath}...`);
      await downloadFile(downloadUrl, localDest);
      if (fs.existsSync(localDest)) {
        const size = fs.statSync(localDest).size;
        console.log(`  Saved: ${cleanRelPath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
      }
    } catch (e) {
      console.error(` ❌ Error downloading ${cleanRelPath}:`, e.message);
    }
  }

  console.log('\n✅ All upload audio and image files processed!');
}

main().catch(err => {
  console.error('❌ Sync uploads script failed:', err);
  process.exit(1);
});
