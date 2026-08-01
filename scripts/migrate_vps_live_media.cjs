const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

const REMOTE_DIR = '/home/chorus/htdocs/chorus.vn';

async function main() {
  console.log('==================================================');
  console.log('🚀 MIGRATING ALL VPS 2 LIVE MEDIA TO R2 & UPDATING DB/JSON');
  console.log('==================================================\n');

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH Connected to VPS 2 (160.187.147.125).\n');

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(out);
        else reject(new Error(`Command "${cmd}" exited with code ${code}.\nSTDERR: ${errOut}\nSTDOUT: ${out}`));
      }).on('data', d => { process.stdout.write(d); out += d.toString(); })
        .stderr.on('data', d => { process.stderr.write(d); errOut += d.toString(); });
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  // Step 1: Create a remote migration runner script on VPS 2
  console.log('=== Step 1: Creating remote migration runner on VPS 2 ===');

  const remoteRunnerScript = `
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      process.env[key.trim()] = valParts.join('=').trim();
    }
  });
}

let S3Client, PutObjectCommand;

async function getS3Client() {
  if (!S3Client) {
    try {
      const s3Module = await import('@aws-sdk/client-s3');
      S3Client = s3Module.S3Client;
      PutObjectCommand = s3Module.PutObjectCommand;
    } catch (e) {
      const s3Module = require('@aws-sdk/client-s3');
      S3Client = s3Module.S3Client;
      PutObjectCommand = s3Module.PutObjectCommand;
    }
  }
  return new S3Client({
    region: 'auto',
    endpoint: \`https://\${r2AccountId}.r2.cloudflarestorage.com\`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey
    }
  });
}

const r2AccountId = process.env.CF_R2_ACCOUNT_ID || 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || 'de9a5a092fded5861a3c66dc384752e9';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd66bfcd930ae87db5ef6add59e18a784080de8b5be887f3f96aa4e84751cb564';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'chorus-vn';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.chorus.vn').replace(/\\/+$/, '');

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
        return reject(new Error(\`Failed HTTP \${res.statusCode} for \${url}\`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Map username/artist to artistId folder for security
const artistMap = {};
if (fs.existsSync(path.join(__dirname, 'artists.json'))) {
  try {
    const artists = JSON.parse(fs.readFileSync(path.join(__dirname, 'artists.json'), 'utf-8'));
    artists.forEach(a => {
      if (a.username) artistMap[a.username.toLowerCase()] = a.id || a.username;
      if (a.id) artistMap[a.id.toLowerCase()] = a.id;
    });
  } catch (e) {}
}

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

  // Case 1: Firebase URL or HTTP URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      console.log(\`📥 Processing remote URL for [\${folderId}]: \${trimmedUrl.substring(0, 80)}...\`);
      const buffer = await downloadUrlToBuffer(trimmedUrl);

      // Determine extension
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
        filename = \`file_\${Date.now()}.\${ext}\`;
      }

      const mime = getMimeType(filename);
      const relativePath = \`uploads/\${folderId}/\${filename}\`;

      // Save local backup on VPS
      const localBackupPath = path.join(__dirname, 'public', relativePath);
      fs.mkdirSync(path.dirname(localBackupPath), { recursive: true });
      fs.writeFileSync(localBackupPath, buffer);

      // Upload to R2
      const client1 = await getS3Client();
      await client1.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: relativePath,
        Body: buffer,
        ContentType: mime
      }));

      const r2Url = \`\${r2PublicDomain}/\${relativePath}\`;
      console.log(\`  🎉 R2 Uploaded: \${r2Url}\`);
      urlMap.set(trimmedUrl, r2Url);
      return r2Url;
    } catch (err) {
      console.error(\`  ❌ Failed processing URL \${trimmedUrl}: \${err.message}\`);
      return trimmedUrl;
    }
  }

  // Case 2: Local server path e.g. /uploads/xxx
  if (trimmedUrl.startsWith('/uploads/') || trimmedUrl.startsWith('uploads/')) {
    try {
      const relPath = trimmedUrl.startsWith('/') ? trimmedUrl.substring(1) : trimmedUrl;
      const localPath = path.join(__dirname, 'public', relPath);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const mime = getMimeType(localPath);

        const client2 = await getS3Client();
        await client2.send(new PutObjectCommand({
          Bucket: r2BucketName,
          Key: relPath,
          Body: buffer,
          ContentType: mime
        }));

        const r2Url = \`\${r2PublicDomain}/\${relPath}\`;
        console.log(\`  🎉 Local file uploaded to R2: \${r2Url}\`);
        urlMap.set(trimmedUrl, r2Url);
        return r2Url;
      }
    } catch (err) {
      console.error(\`  ❌ Failed uploading local path \${trimmedUrl}: \${err.message}\`);
    }
  }

  return trimmedUrl;
}

async function runMigration() {
  console.log('🔄 Creating pre-migration backups...');
  const ts = Date.now();
  if (fs.existsSync('bbb_global.db')) {
    fs.copyFileSync('bbb_global.db', \`bbb_global.db.bak_\${ts}\`);
  }

  // 1. Process all JSON files
  const files = fs.readdirSync(__dirname);
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('package'));

  for (const jsonFile of jsonFiles) {
    console.log(\`\\n📄 Processing JSON: \${jsonFile}\`);
    const content = fs.readFileSync(jsonFile, 'utf-8');
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
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    console.log(\`  ✅ Updated \${jsonFile}\`);
  }

  // 2. Process SQLite bbb_global.db
  if (fs.existsSync('bbb_global.db')) {
    console.log('\\n🗄️ Processing SQLite bbb_global.db...');
    try {
      const jsonOut = execSync('sqlite3 bbb_global.db ".mode json" "SELECT id, artist_username, title, coverUrl, audioUrl, backgroundUrl, backupAudioUrl FROM songs;"', { encoding: 'utf-8' });
      const songs = JSON.parse(jsonOut || '[]');

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

        const safeCover = (coverUrl || '').replace(/'/g, "''");
        const safeAudio = (audioUrl || '').replace(/'/g, "''");
        const safeBg = (bgUrl || '').replace(/'/g, "''");
        const safeBackup = (backupAudioUrl || '').replace(/'/g, "''");
        const safeId = (song.id || '').replace(/'/g, "''");

        execSync(\`sqlite3 bbb_global.db "UPDATE songs SET coverUrl='\${safeCover}', audioUrl='\${safeAudio}', backgroundUrl='\${safeBg}', backupAudioUrl='\${safeBackup}' WHERE id='\${safeId}';"\`);
      }
      console.log(\`  ✅ Updated \${songs.length} songs in bbb_global.db\`);
    } catch (e) {
      console.error("  ❌ Error updating SQLite bbb_global.db:", e.message);
    }
  }

  console.log('\\n==================================================');
  console.log('🎉 LIVE VPS MIGRATION COMPLETE!');
  console.log('==================================================');
}

runMigration().catch(err => {
  console.error("Migration Error:", err);
  process.exit(1);
});
`;

  // Upload runner script to VPS 2
  const remoteScriptPath = `${REMOTE_DIR}/run_live_migration.cjs`;
  await new Promise((resolve, reject) => {
    sftp.writeFile(remoteScriptPath, remoteRunnerScript, (err) => err ? reject(err) : resolve());
  });
  console.log('✅ Remote migration script written to VPS 2.\n');

  // Step 2: Execute remote migration script on VPS 2
  console.log('=== Step 2: Executing live migration on VPS 2 ===');
  await execCmd(`cd ${REMOTE_DIR} && node run_live_migration.cjs`);

  // Step 3: Restart PM2 on VPS 2
  console.log('\n=== Step 3: Restarting PM2 process (chorusvn) ===');
  await execCmd(`cd ${REMOTE_DIR} && pm2 restart chorusvn || pm2 restart 0`);

  // Cleanup remote runner script
  await execCmd(`rm -f ${remoteScriptPath}`);

  conn.end();
  console.log('\n✅ VPS 2 LIVE MEDIA MIGRATION FINISHED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
