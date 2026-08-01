const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('ssh2');

const SSH_CONFIG_VPS2 = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};
const REMOTE_DIR_VPS2 = '/home/chorus/htdocs/chorus.vn';

const r2AccountId = 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = 'de9a5a092fded5861a3c66dc384752e9';
const r2SecretAccessKey = 'd66bfcd930ae87db5ef6add59e18a784080de8b5be887f3f96aa4e84751cb564';
const r2BucketName = 'chorus-vn';
const r2PublicDomain = 'https://cdn.chorus.vn';

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
  return 'application/octet-stream';
}

async function fixUrl(url, artistId = 'system') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith(r2PublicDomain)) return trimmed;

  // Local uploads path
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const relPath = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
    const localPath = path.join(__dirname, '..', 'public', relPath);

    if (fs.existsSync(localPath)) {
      console.log(`Uploading local file to R2: ${relPath}`);
      const buffer = fs.readFileSync(localPath);
      const mime = getMimeType(localPath);
      await s3Client.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: relPath,
        Body: buffer,
        ContentType: mime
      }));
      return `${r2PublicDomain}/${relPath}`;
    } else {
      console.log(`⚠️ Missing local file '${relPath}' for ${artistId} -> Clearing URL`);
      return '';
    }
  }

  return trimmed;
}

async function main() {
  console.log("=== CLEANING & MIGRATING ALL REMAINING URLS ===");

  // 1. Process JSON files
  const rootDir = path.join(__dirname, '..');
  const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.json') && !f.startsWith('package'));

  for (const jsonFile of files) {
    const filePath = path.join(rootDir, jsonFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try { data = JSON.parse(content); } catch (e) { continue; }

    const artistId = data.username || data.id || 'system';

    async function walk(obj) {
      if (!obj) return;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          if (typeof obj[i] === 'string') {
            obj[i] = await fixUrl(obj[i], artistId);
          } else if (typeof obj[i] === 'object') {
            await walk(obj[i]);
          }
        }
      } else if (typeof obj === 'object') {
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'string' && (k.toLowerCase().includes('url') || k.toLowerCase().includes('cover') || k.toLowerCase().includes('bg'))) {
            obj[k] = await fixUrl(obj[k], artistId);
          } else if (typeof obj[k] === 'object') {
            await walk(obj[k]);
          }
        }
      }
    }

    await walk(data);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Cleaned ${jsonFile}`);
  }

  // 2. Process bbb_global.db
  const dbPath = path.join(rootDir, 'bbb_global.db');
  if (fs.existsSync(dbPath)) {
    const db = new sqlite3.Database(dbPath);
    const songs = await new Promise((res, rej) => db.all("SELECT * FROM songs", (e, r) => e ? rej(e) : res(r)));

    for (const song of songs) {
      const artistId = song.artist_username || 'system';
      const coverUrl = await fixUrl(song.coverUrl, artistId);
      const audioUrl = await fixUrl(song.audioUrl, artistId);
      const backgroundUrl = await fixUrl(song.backgroundUrl, artistId);

      let backupAudioUrl = song.backupAudioUrl || '';
      if (audioUrl && audioUrl.startsWith(r2PublicDomain)) {
        const key = audioUrl.replace(r2PublicDomain, '');
        backupAudioUrl = key.startsWith('/') ? key : '/' + key;
      }

      await new Promise((res, rej) => {
        db.run("UPDATE songs SET coverUrl = ?, audioUrl = ?, backgroundUrl = ?, backupAudioUrl = ? WHERE id = ?",
          [coverUrl, audioUrl, backgroundUrl, backupAudioUrl, song.id], (e) => e ? rej(e) : res());
      });
    }
    db.close();
    console.log(`✅ Cleaned SQLite bbb_global.db`);
  }

  // 3. Upload cleaned JSONs & DB to VPS 2
  console.log("\n=== UPLOADING CLEANED DATA TO VPS 2 ===");
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect(SSH_CONFIG_VPS2));
  const sftp = await new Promise((res, rej) => conn.sftp((e, s) => e ? rej(e) : res(s)));
  const execCmd = (cmd) => new Promise((res) => conn.exec(cmd, (e, stream) => { stream.on('close', res); }));

  const putFile = (local, remote) => new Promise((res, rej) => sftp.fastPut(local, remote, (e) => e ? rej(e) : res()));

  await putFile(dbPath, `${REMOTE_DIR_VPS2}/bbb_global.db`);
  console.log('  ✅ Uploaded cleaned bbb_global.db');

  for (const jsonFile of files) {
    await putFile(path.join(rootDir, jsonFile), `${REMOTE_DIR_VPS2}/${jsonFile}`);
    console.log(`  ✅ Uploaded cleaned ${jsonFile}`);
  }

  await execCmd(`chown -R chorus:chorus ${REMOTE_DIR_VPS2} || true`);
  await execCmd(`pm2 restart chorusvn || pm2 restart 0`);
  console.log('  ✅ Restarted PM2 on VPS 2');

  conn.end();
  console.log("\n🎉 ALL URLs CLEANED & SYNCED TO R2!");
}

main().catch(console.error);
