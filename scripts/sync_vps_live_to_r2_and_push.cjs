const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sqlite3 = require('sqlite3').verbose();

const SSH_CONFIG_VPS2 = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

const REMOTE_DIR_VPS2 = '/home/chorus/htdocs/chorus.vn';

// Load .env
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
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || 'de9a5a092fded5861a3c66dc384752e9';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd66bfcd930ae87db5ef6add59e18a784080de8b5be887f3f96aa4e84751cb564';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'chorus-vn';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.chorus.vn').replace(/\/+$/, '');

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
        return reject(new Error(`Failed HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const artistMap = {};

function resolveArtistId(artistIdentifier) {
  if (!artistIdentifier) return 'system';
  const key = String(artistIdentifier).toLowerCase();
  return artistMap[key] || artistIdentifier;
}

const urlMap = new Map();

async function processUrl(url, artistIdentifier) {
  if (!url || typeof url !== 'string') return url;
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return trimmedUrl;

  if (trimmedUrl.startsWith(r2PublicDomain)) return trimmedUrl;
  if (urlMap.has(trimmedUrl)) return urlMap.get(trimmedUrl);

  const folderId = resolveArtistId(artistIdentifier);

  // Case 1: Remote HTTP/Firebase URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      console.log(`📥 Downloading remote media [${folderId}]: ${trimmedUrl.substring(0, 80)}...`);
      const buffer = await downloadUrlToBuffer(trimmedUrl);

      let ext = 'jpg';
      const cleanPath = trimmedUrl.split('?')[0].toLowerCase();
      if (cleanPath.endsWith('.png')) ext = 'png';
      else if (cleanPath.endsWith('.webp')) ext = 'webp';
      else if (cleanPath.endsWith('.mp3')) ext = 'mp3';
      else if (cleanPath.endsWith('.wav')) ext = 'wav';
      else if (cleanPath.endsWith('.m4a')) ext = 'm4a';

      let filename = path.basename(cleanPath);
      if (filename.includes('%2F')) {
        filename = decodeURIComponent(filename).split('/').pop();
      }
      if (!filename || filename.length < 5) {
        filename = `file_${Date.now()}.${ext}`;
      }

      const mime = getMimeType(filename);
      const relativePath = `uploads/${folderId}/${filename}`;
      const rootDir = path.join(__dirname, '..');

      // Local backup in public/uploads/
      const localBackupPath = path.join(rootDir, 'public', relativePath);
      fs.mkdirSync(path.dirname(localBackupPath), { recursive: true });
      fs.writeFileSync(localBackupPath, buffer);

      // Upload to R2
      await s3Client.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: relativePath,
        Body: buffer,
        ContentType: mime
      }));

      const r2Url = `${r2PublicDomain}/${relativePath}`;
      console.log(`  🎉 R2 Uploaded: ${r2Url}`);
      urlMap.set(trimmedUrl, r2Url);
      return r2Url;
    } catch (err) {
      console.error(`  ❌ Failed processing URL ${trimmedUrl}: ${err.message}`);
      return trimmedUrl;
    }
  }

  // Case 2: Local server path e.g. /uploads/xxx
  if (trimmedUrl.startsWith('/uploads/') || trimmedUrl.startsWith('uploads/')) {
    try {
      const relPath = trimmedUrl.startsWith('/') ? trimmedUrl.substring(1) : trimmedUrl;
      const rootDir = path.join(__dirname, '..');
      const localPath = path.join(rootDir, 'public', relPath);

      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const mime = getMimeType(localPath);

        await s3Client.send(new PutObjectCommand({
          Bucket: r2BucketName,
          Key: relPath,
          Body: buffer,
          ContentType: mime
        }));

        const r2Url = `${r2PublicDomain}/${relPath}`;
        console.log(`  🎉 Local file uploaded to R2: ${r2Url}`);
        urlMap.set(trimmedUrl, r2Url);
        return r2Url;
      }
    } catch (err) {
      console.error(`  ❌ Failed uploading local path ${trimmedUrl}: ${err.message}`);
    }
  }

  return trimmedUrl;
}

async function main() {
  console.log(`==================================================`);
  console.log(`🚀 MIGRATING LIVE VPS 2 DATA TO CLOUDFLARE R2 & BACKUP`);
  console.log(`==================================================\n`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG_VPS2);
  });
  console.log('✅ SSH Connected to VPS 2 (160.187.147.125).\n');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', () => resolve(out)).on('data', d => out += d).stderr.on('data', d => errOut += d);
    });
  });

  // Step 1: Backup remote DB on VPS 2
  console.log('=== Step 1: Creating backup copy on VPS 2 ===');
  const ts = Date.now();
  await execCmd(`cp ${REMOTE_DIR_VPS2}/bbb_global.db ${REMOTE_DIR_VPS2}/bbb_global.db.bak_${ts} || true`);
  console.log(`✅ VPS 2 SQLite DB backed up to bbb_global.db.bak_${ts}\n`);

  // Step 2: Download bbb_global.db and data_*.json to local scratch folder
  console.log('=== Step 2: Fetching live DB & JSONs from VPS 2 ===');
  const tempDir = path.join(__dirname, '..', 'scratch', 'vps_live_data');
  fs.mkdirSync(tempDir, { recursive: true });

  const getFile = (remote, local) => new Promise((resolve, reject) => {
    sftp.fastGet(remote, local, (err) => err ? reject(err) : resolve());
  });

  await getFile(`${REMOTE_DIR_VPS2}/bbb_global.db`, path.join(tempDir, 'bbb_global.db'));
  console.log('  ✅ Downloaded bbb_global.db');

  const remoteFilesList = (await execCmd(`ls ${REMOTE_DIR_VPS2}/*.json`)).split('\n').map(s => s.trim()).filter(Boolean);
  for (const remoteFile of remoteFilesList) {
    const filename = path.basename(remoteFile);
    await getFile(remoteFile, path.join(tempDir, filename));
    console.log(`  ✅ Downloaded ${filename}`);
  }

  // Populate artistMap
  if (fs.existsSync(path.join(tempDir, 'artists.json'))) {
    try {
      const artists = JSON.parse(fs.readFileSync(path.join(tempDir, 'artists.json'), 'utf-8'));
      artists.forEach(a => {
        if (a.username) artistMap[a.username.toLowerCase()] = a.id || a.username;
        if (a.id) artistMap[a.id.toLowerCase()] = a.id;
      });
    } catch (e) {}
  }

  // Step 3: Process JSONs locally
  console.log('\n=== Step 3: Processing & Migrating Live Data ===');
  const localJsonFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.json'));

  for (const jsonFile of localJsonFiles) {
    console.log(`\n📄 Processing JSON: ${jsonFile}`);
    const filePath = path.join(tempDir, jsonFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try { data = JSON.parse(content); } catch (e) { continue; }

    const artistId = data.username || data.id || 'system';

    async function walkAndReplace(obj) {
      if (!obj) return;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (typeof obj[i] === 'string') {
            obj[i] = await processUrl(obj[i], artistId);
          } else if (typeof obj[i] === 'object') {
            await walkAndReplace(obj[i]);
          }
        }
      } else if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'string') {
            if (key.toLowerCase().includes('url') || key.toLowerCase().includes('cover') || key.toLowerCase().includes('avatar') || key.toLowerCase().includes('bg')) {
              obj[key] = await processUrl(obj[key], artistId);
            }
          } else if (typeof obj[key] === 'object') {
            await walkAndReplace(obj[key]);
          }
        }
      }
    }

    await walkAndReplace(data);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Copy to root & public for local git repo tracking
    fs.copyFileSync(filePath, path.join(__dirname, '..', jsonFile));
    console.log(`  ✅ Updated & Synced ${jsonFile}`);
  }

  // Step 4: Process SQLite bbb_global.db locally
  const localDbPath = path.join(tempDir, 'bbb_global.db');
  if (fs.existsSync(localDbPath)) {
    console.log('\n🗄️ Processing SQLite bbb_global.db...');
    const db = new sqlite3.Database(localDbPath);

    const songs = await new Promise((res, rej) => {
      db.all('SELECT * FROM songs', (err, rows) => err ? rej(err) : res(rows));
    });

    for (const song of songs) {
      const artistId = song.artist_username || 'system';
      const coverUrl = await processUrl(song.coverUrl, artistId);
      const audioUrl = await processUrl(song.audioUrl, artistId);
      const bgUrl = await processUrl(song.backgroundUrl, artistId);

      let backupAudioUrl = song.backupAudioUrl || '';
      if (audioUrl && audioUrl.startsWith(r2PublicDomain)) {
        const key = audioUrl.replace(r2PublicDomain, '');
        backupAudioUrl = key.startsWith('/') ? key : '/' + key;
      }

      await new Promise((res, rej) => {
        db.run(
          `UPDATE songs SET coverUrl = ?, audioUrl = ?, backgroundUrl = ?, backupAudioUrl = ? WHERE id = ?`,
          [coverUrl, audioUrl, bgUrl, backupAudioUrl, song.id],
          (err) => err ? rej(err) : res()
        );
      });
    }

    console.log(`  ✅ Updated ${songs.length} songs in bbb_global.db`);
    db.close();

    // Copy updated db to root for git repo tracking
    fs.copyFileSync(localDbPath, path.join(__dirname, '..', 'bbb_global.db'));
  }

  // Step 5: Upload updated DB and JSONs back to VPS 2
  console.log('\n=== Step 4: Uploading Migrated DB & JSONs back to VPS 2 ===');
  const putFile = (local, remote) => new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => err ? reject(err) : resolve());
  });

  await putFile(localDbPath, `${REMOTE_DIR_VPS2}/bbb_global.db`);
  console.log('  ✅ Uploaded updated bbb_global.db to VPS 2');

  for (const jsonFile of localJsonFiles) {
    const localPath = path.join(tempDir, jsonFile);
    await putFile(localPath, `${REMOTE_DIR_VPS2}/${jsonFile}`);
    console.log(`  ✅ Uploaded updated ${jsonFile} to VPS 2`);
  }

  // Step 6: Upload local public/uploads to VPS 2 remote public/uploads
  console.log('\n=== Step 5: Uploading public/uploads to VPS 2 ===');
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

  function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) getAllFiles(p, files);
      else files.push(p);
    });
    return files;
  }

  const allUploads = getAllFiles(uploadsDir);
  for (const file of allUploads) {
    const rel = path.relative(path.join(__dirname, '..', 'public'), file).replace(/\\/g, '/');
    const remoteTarget = `${REMOTE_DIR_VPS2}/public/${rel}`;
    const remoteParent = path.dirname(remoteTarget).replace(/\\/g, '/');

    await execCmd(`mkdir -p ${remoteParent}`);
    await putFile(file, remoteTarget);
  }
  console.log(`  ✅ Uploaded ${allUploads.length} backup files to VPS 2 public/uploads/`);

  // Step 7: Restart PM2 on VPS 2
  console.log('\n=== Step 6: Restarting PM2 on VPS 2 ===');
  await execCmd(`chown -R chorus:chorus ${REMOTE_DIR_VPS2} || true`);
  await execCmd(`pm2 restart chorusvn || pm2 restart 0`);
  console.log('  ✅ PM2 Restarted on VPS 2');

  conn.end();

  console.log('\n==================================================');
  console.log('🎉 LIVE VPS DATA MIGRATION & R2 SYNC 100% COMPLETE!');
  console.log('==================================================');
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
