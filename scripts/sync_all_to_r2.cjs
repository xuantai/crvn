const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const r2AccountId = process.env.CF_R2_ACCOUNT_ID || 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || '8ae592287e83828ec9c5b5aa468500e6';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'bbb-bz';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.chorus.vn').replace(/\/$/, '');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/m4a';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function downloadUrlToBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrlToBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download URL ${url}, status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadBufferToR2(buffer, r2Key, contentType) {
  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: r2Key,
    Body: buffer,
    ContentType: contentType
  });
  await s3Client.send(command);
  const publicUrl = `${r2PublicDomain}/${r2Key}`;
  console.log(`✅ [R2 Uploaded] -> ${publicUrl}`);
  return publicUrl;
}

async function processFileOrUrl(urlOrPath, artistId, defaultExt = 'jpg') {
  if (!urlOrPath) return urlOrPath;
  if (urlOrPath.startsWith(r2PublicDomain)) return urlOrPath; // Already on R2!

  const rootDir = path.join(__dirname, '..');

  // Case 1: Local path e.g. /uploads/xxx or uploads/xxx
  if (urlOrPath.startsWith('/uploads/') || urlOrPath.startsWith('uploads/')) {
    const relPath = urlOrPath.startsWith('/') ? urlOrPath.substring(1) : urlOrPath;
    const localPath = path.join(rootDir, 'public', relPath);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const mime = getMimeType(localPath);
      return await uploadBufferToR2(buffer, relPath, mime);
    }
  }

  // Case 2: Remote URL e.g. Firebase or HTTP(S) link
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    try {
      console.log(`📥 Downloading remote URL to upload to R2: ${urlOrPath}`);
      const buffer = await downloadUrlToBuffer(urlOrPath);
      const ext = urlOrPath.includes('.png') ? 'png' : (urlOrPath.includes('.mp3') ? 'mp3' : defaultExt);
      const mime = ext === 'mp3' ? 'audio/mpeg' : (ext === 'png' ? 'image/png' : 'image/jpeg');
      const filename = `synced_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      const r2Key = `uploads/${artistId}/${filename}`;
      
      // Also save a local copy on VPS SSD so 1 copy is on VPS, 1 on R2!
      const localDir = path.join(rootDir, 'public', 'uploads', artistId);
      fs.mkdirSync(localDir, { recursive: true });
      fs.writeFileSync(path.join(localDir, filename), buffer);

      return await uploadBufferToR2(buffer, r2Key, mime);
    } catch (err) {
      console.error(`❌ Failed to process remote URL ${urlOrPath}:`, err.message);
      return urlOrPath;
    }
  }

  return urlOrPath;
}

async function syncAll() {
  console.log(`========================================`);
  console.log(`🚀 COMPREHENSIVE R2 SYNC (INCLUDING FIREBASE & LOCAL FILES)`);
  console.log(`========================================\n`);

  const rootDir = path.join(__dirname, '..');
  const filesInRoot = fs.readdirSync(rootDir);
  const dataFiles = filesInRoot.filter(f => f.startsWith('data_') && f.endsWith('.json'));

  let totalUpdated = 0;

  for (const dataFile of dataFiles) {
    const artistUsername = dataFile.replace('data_', '').replace('.json', '');
    const filePath = path.join(rootDir, dataFile);
    console.log(`📂 Đang quét tệp dữ liệu nghệ sĩ: ${dataFile} (${artistUsername})...`);
    
    let content;
    try {
      content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.log(`❌ Lỗi đọc ${dataFile}:`, e.message);
      continue;
    }

    let modified = false;

    // 1. Sync Demos / Songs
    if (content.demos && Array.isArray(content.demos)) {
      for (const demo of content.demos) {
        if (demo.audioUrl) {
          const newUrl = await processFileOrUrl(demo.audioUrl, artistUsername, 'mp3');
          if (newUrl && newUrl !== demo.audioUrl) {
            demo.audioUrl = newUrl;
            modified = true;
          }
        }
        if (demo.backupAudioUrl) {
          const newUrl = await processFileOrUrl(demo.backupAudioUrl, artistUsername, 'mp3');
          if (newUrl && newUrl !== demo.backupAudioUrl) {
            demo.backupAudioUrl = newUrl;
            modified = true;
          }
        }
        if (demo.coverUrl) {
          const newUrl = await processFileOrUrl(demo.coverUrl, artistUsername, 'jpg');
          if (newUrl && newUrl !== demo.coverUrl) {
            demo.coverUrl = newUrl;
            modified = true;
          }
        }
      }
    }

    // 2. Sync Playlists
    if (content.playlists && Array.isArray(content.playlists)) {
      for (const playlist of content.playlists) {
        if (playlist.coverUrl) {
          const newUrl = await processFileOrUrl(playlist.coverUrl, artistUsername, 'jpg');
          if (newUrl && newUrl !== playlist.coverUrl) {
            playlist.coverUrl = newUrl;
            modified = true;
          }
        }
      }
    }

    // 3. Sync Artist Global Assets
    const assetKeys = ['homeCoverUrl', 'faviconUrl', 'ogImageUrl', 'avatarUrl', 'backgroundUrl'];
    for (const key of assetKeys) {
      if (content[key]) {
        const newUrl = await processFileOrUrl(content[key], artistUsername, 'jpg');
        if (newUrl && newUrl !== content[key]) {
          content[key] = newUrl;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
      console.log(`💾 ĐÃ LƯU TỆP DỮ LIỆU ĐÃ ĐỒNG BỘ R2: ${dataFile}\n`);
      totalUpdated++;
    }
  }

  console.log(`========================================`);
  console.log(`✅ HOÀN THÀNH TẤT CẢ TỆP DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN SANG R2 BUCKET (bbb-bz)! Updated ${totalUpdated} JSON files.`);
  console.log(`========================================`);
}

syncAll().catch(err => console.error("❌ Sync Error:", err));
