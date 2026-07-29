const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('ssh2');

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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('=== 1. FETCHING LIST OF IMAGES FROM FIREBASE STORAGE ===');
  const data = await fetchFirebaseItems();
  const items = (data.items || []).filter(item => item.name.includes('sw69l6795go'));

  console.log(`Found ${items.length} images in uploads/sw69l6795go`);

  const tempDir = path.join(__dirname, 'temp_sw69_images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log('=== 2. DOWNLOADING ALL IMAGES LOCALLY ===');
  let count = 0;
  for (const item of items) {
    const filename = path.basename(item.name);
    const encodedName = encodeURIComponent(item.name);
    const token = item.downloadTokens || '';
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o/${encodedName}?alt=media${token ? '&token=' + token : ''}`;

    const destPath = path.join(tempDir, filename);
    await downloadFile(publicUrl, destPath);
    count++;
    console.log(`[${count}/${items.length}] Downloaded: ${filename}`);
  }

  console.log('=== 3. CREATING ZIP FILE ===');
  const zipPath = path.join(__dirname, 'sw69l6795go_images.zip');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // Compress using PowerShell Compress-Archive
  const psCmd = `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd);
  console.log('✅ Created zip file locally:', zipPath);

  const stats = fs.statSync(zipPath);
  console.log(`Zip file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  console.log('=== 4. UPLOADING ZIP FILE TO CHORUS VPS [160.187.147.125] ===');
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✅ SSH CONNECTED TO CHORUS VPS');
    conn.sftp((err, sftp) => {
      if (err) throw err;
      sftp.fastPut(
        zipPath,
        '/home/chorus/htdocs/chorus.vn/public/sw69l6795go_images.zip',
        (err) => {
          if (err) {
            console.error('SFTP Upload Error:', err);
          } else {
            console.log('✅ Uploaded sw69l6795go_images.zip to /home/chorus/htdocs/chorus.vn/public/sw69l6795go_images.zip');
          }
          conn.end();
        }
      );
    });
  }).connect({
    host: '160.187.147.125',
    port: 22,
    username: 'root',
    password: 'MatKhauDay123@',
    readyTimeout: 30000
  });
}

main().catch(console.error);
