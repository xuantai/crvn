const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sqlite3 = require('sqlite3').verbose();

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      process.env[key.trim()] = valParts.join('=').trim();
    }
  });
}

const r2AccountId = process.env.CF_R2_ACCOUNT_ID || 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || '8ae592287e83828ec9c5b5aa468500e6';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'chorus-cdn';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.chorus.vn').replace(/\/+$/, '');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToR2(key, body, contentType) {
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  await r2Client.send(new PutObjectCommand({
    Bucket: r2BucketName,
    Key: cleanKey,
    Body: body,
    ContentType: contentType
  }));
  return `${r2PublicDomain}/${cleanKey}`;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.mp3': return 'audio/mpeg';
    case '.wav': return 'audio/wav';
    case '.m4a': return 'audio/m4a';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}

const FIREBASE_REGEX = /https?:\/\/(?:firebasestorage\.googleapis\.com|firebasestorage\.app|storage\.googleapis\.com)[^\s"'<>\)]+/gi;

async function main() {
  console.log('🚀 Starting Firebase Storage to Cloudflare R2 Migration Script...');
  console.log(`- CDN Domain: ${r2PublicDomain}`);
  console.log(`- R2 Bucket: ${r2BucketName}`);

  const rootDir = path.join(__dirname, '..');
  const artistsFile = path.join(rootDir, 'artists.json');

  // Load artist username -> id mapping
  let artistMap = {};
  if (fs.existsSync(artistsFile)) {
    const artistsData = JSON.parse(fs.readFileSync(artistsFile, 'utf-8'));
    for (const art of artistsData) {
      if (art.username) artistMap[art.username] = art.id || art.username;
      if (art.extension) artistMap[art.extension] = art.id || art.extension;
      if (art.id) artistMap[art.id] = art.id;
    }
  }

  // Find all JSON files to scan
  const filesToScan = [];
  const dirEntries = fs.readdirSync(rootDir);
  for (const entry of dirEntries) {
    if (entry.endsWith('.json') && !entry.includes('package') && !entry.includes('tsconfig')) {
      filesToScan.push(path.join(rootDir, entry));
    }
  }

  console.log(`\n📋 Found ${filesToScan.length} JSON files to scan.`);

  // Collect all Firebase URLs from JSON files AND from Firebase Storage API
  const urlToContextMap = new Map(); // firebaseURL -> { defaultArtistId, rawUrl }

  // Step A: Scan JSON files
  for (const filePath of filesToScan) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(FIREBASE_REGEX);
    if (matches && matches.length > 0) {
      let defaultArtistId = 'system';
      if (filename.startsWith('data_')) {
        const username = filename.replace('data_', '').replace('.json', '');
        defaultArtistId = artistMap[username] || username;
      }
      for (const rawUrl of matches) {
        const cleanUrl = rawUrl.replace(/\\+$/, '').replace(/&amp;/g, '&');
        if (!urlToContextMap.has(cleanUrl)) {
          urlToContextMap.set(cleanUrl, { defaultArtistId, rawUrl: cleanUrl });
        }
      }
    }
  }

  // Step B: Fetch directly from Firebase Storage REST API
  console.log('\n🌐 Fetching all objects directly from Firebase Storage REST API...');
  try {
    const fbApiUrl = 'https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o';
    const apiResBuf = await downloadBuffer(fbApiUrl);
    const apiData = JSON.parse(apiResBuf.toString('utf-8'));
    const items = apiData.items || [];
    console.log(`  -> Found ${items.length} total items in Firebase Storage API.`);

    for (const item of items) {
      const encodedName = encodeURIComponent(item.name);
      const token = item.downloadTokens || '';
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o/${encodedName}?alt=media${token ? '&token=' + token : ''}`;
      
      if (!urlToContextMap.has(publicUrl)) {
        urlToContextMap.set(publicUrl, { defaultArtistId: 'system', rawUrl: publicUrl, itemName: item.name });
      }
    }
  } catch (e) {
    console.error('  ⚠️ Warning: Failed to fetch from Firebase Storage REST API:', e.message);
  }

  console.log(`\n🔍 Found total ${urlToContextMap.size} unique Firebase Storage URLs/items to migrate.`);

  // Process and migrate each URL
  const replacementMap = new Map(); // firebaseURL -> newCdnUrl
  let processedCount = 0;
  let errorCount = 0;

  for (const [firebaseUrl, ctx] of urlToContextMap.entries()) {
    processedCount++;
    console.log(`\n--------------------------------------------------`);
    console.log(`[${processedCount}/${urlToContextMap.size}] Processing: ${firebaseUrl}`);

    try {
      // Decode Firebase URL to extract internal path & filename
      const decodedUrl = decodeURIComponent(firebaseUrl);
      
      let targetArtistId = ctx.defaultArtistId;
      let filename = '';

      const oIdx = decodedUrl.indexOf('/o/');
      let internalPath = '';
      if (oIdx !== -1) {
        internalPath = decodedUrl.substring(oIdx + 3).split('?')[0];
      }

      if (internalPath.startsWith('uploads/')) {
        internalPath = internalPath.substring(8);
      }

      const parts = internalPath.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const potentialFolder = parts[0];
        targetArtistId = artistMap[potentialFolder] || potentialFolder;
        filename = parts.slice(1).join('_');
      } else if (parts.length === 1 && parts[0]) {
        filename = parts[0];
      } else {
        const urlObj = new URL(firebaseUrl);
        filename = path.basename(urlObj.pathname) || `file_${Date.now()}.jpg`;
      }

      // Sanitize filename
      filename = filename.replace(/[^a-zA-Z0-9\._\-]/g, '_');
      if (!filename.includes('.')) filename += '.jpg';

      console.log(`  -> Detected Folder/ArtistID: ${targetArtistId}`);
      console.log(`  -> Target Filename: ${filename}`);

      // Step 1: Download File Buffer
      console.log(`  -> Downloading file from Firebase...`);
      const fileBuffer = await downloadBuffer(firebaseUrl);
      console.log(`  -> Downloaded ${fileBuffer.length} bytes.`);

      // Step 2: Save Local Server Backup
      const localRelDir = path.join('public', 'uploads', targetArtistId);
      const localAbsDir = path.join(rootDir, localRelDir);
      fs.mkdirSync(localAbsDir, { recursive: true });

      const localAbsPath = path.join(localAbsDir, filename);
      fs.writeFileSync(localAbsPath, fileBuffer);
      console.log(`  ✅ Local Backup saved: ${localAbsPath}`);

      // Step 3: Upload to Cloudflare R2
      const r2Key = `uploads/${targetArtistId}/${filename}`;
      const contentType = getContentType(filename);
      console.log(`  -> Uploading to Cloudflare R2: ${r2Key} (${contentType})...`);
      const newCdnUrl = await uploadToR2(r2Key, fileBuffer, contentType);
      console.log(`  🎉 Cloudflare R2 Uploaded: ${newCdnUrl}`);

      replacementMap.set(firebaseUrl, newCdnUrl);
    } catch (err) {
      errorCount++;
      console.error(`  ❌ Error processing ${firebaseUrl}:`, err.message || err);
    }
  }

  console.log(`\n==================================================`);
  console.log(`📊 Migration Summary: ${replacementMap.size} succeeded, ${errorCount} failed.`);
  console.log(`==================================================`);

  if (replacementMap.size > 0) {
    console.log('\n🔄 Updating all JSON files with new Cloudflare R2 URLs...');

    for (const filePath of filesToScan) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let changed = false;

      for (const [oldUrl, newUrl] of replacementMap.entries()) {
        if (content.includes(oldUrl)) {
          content = content.split(oldUrl).join(newUrl);
          changed = true;
        }
        // Also check encoded variations
        const encodedOld = encodeURIComponent(oldUrl);
        const encodedNew = encodeURIComponent(newUrl);
        if (content.includes(encodedOld)) {
          content = content.split(encodedOld).join(encodedNew);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Updated ${path.basename(filePath)}`);
      }
    }

    // Step 4: Update SQLite Database `bbb_global.db` if exists
    const dbPath = path.join(rootDir, 'bbb_global.db');
    if (fs.existsSync(dbPath)) {
      console.log('\n🔄 Updating SQLite Database bbb_global.db...');
      const db = new sqlite3.Database(dbPath);

      const runSql = (sql, params = []) => new Promise((res, rej) => {
        db.run(sql, params, function(err) {
          if (err) rej(err); else res(this);
        });
      });

      for (const [oldUrl, newUrl] of replacementMap.entries()) {
        await runSql(`UPDATE artists SET data_json = REPLACE(data_json, ?, ?) WHERE data_json LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
        await runSql(`UPDATE artists SET homeCoverUrl = REPLACE(homeCoverUrl, ?, ?) WHERE homeCoverUrl LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
        await runSql(`UPDATE artists SET avatarUrl = REPLACE(avatarUrl, ?, ?) WHERE avatarUrl LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);

        await runSql(`UPDATE songs SET song_json = REPLACE(song_json, ?, ?) WHERE song_json LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
        await runSql(`UPDATE songs SET coverUrl = REPLACE(coverUrl, ?, ?) WHERE coverUrl LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
        await runSql(`UPDATE songs SET audioUrl = REPLACE(audioUrl, ?, ?) WHERE audioUrl LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);

        await runSql(`UPDATE playlists SET playlist_json = REPLACE(playlist_json, ?, ?) WHERE playlist_json LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
        await runSql(`UPDATE playlists SET coverUrl = REPLACE(coverUrl, ?, ?) WHERE coverUrl LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);

        await runSql(`UPDATE system_configs SET config_value = REPLACE(config_value, ?, ?) WHERE config_value LIKE ?`, [oldUrl, newUrl, `%${oldUrl}%`]);
      }

      db.close();
      console.log('  ✅ SQLite Database bbb_global.db updated successfully.');
    }
  }

  console.log('\n✨ All Firebase media files successfully migrated to Cloudflare R2 and backed up on local server!');
}

main().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
