const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Client } = require('ssh2');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://ed5771d045bec5ae12373a1dc5bb6985.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '8ae592287e83828ec9c5b5aa468500e6',
    secretAccessKey: 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59'
  }
});

const BUCKET_BBB = 'bbb-bz';
const CDN_BBB = 'https://cdn.bbb.bz';

function getJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function getMimeType(url) {
  if (url.includes('.png')) return 'image/png';
  if (url.includes('.webp')) return 'image/webp';
  if (url.includes('.gif')) return 'image/gif';
  if (url.includes('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

async function uploadToR2(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_BBB,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });
  await s3Client.send(command);
  return `${CDN_BBB}/${key}`;
}

async function main() {
  console.log('=== Step 1: Fetching full acxuantai data from tài.vn (chorus.vn) ===');
  const sourceData = await getJson('https://chorus.vn/api/data?artist=acxuantai');
  if (!sourceData || !sourceData.aboutMe) {
    throw new Error('Failed to fetch valid aboutMe data from chorus.vn');
  }
  console.log('Fetched aboutMe & biography successfully!');

  const localUploadDir = path.join(process.cwd(), 'uploads', 'acxuantai');
  const publicUploadDir = path.join(process.cwd(), 'public', 'uploads', 'acxuantai');
  [localUploadDir, publicUploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const urlMap = new Map();

  function collectUrls(obj) {
    if (!obj) return;
    if (typeof obj === 'string') {
      if ((obj.startsWith('http://') || obj.startsWith('https://')) && !urlMap.has(obj)) {
        if (obj.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || obj.includes('firebasestorage') || obj.includes('acxuantai.com') || obj.includes('chorus.vn')) {
          urlMap.set(obj, '');
        }
      }
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(collectUrls);
      return;
    }
    if (typeof obj === 'object') {
      for (const k in obj) {
        collectUrls(obj[k]);
      }
    }
  }

  collectUrls(sourceData.aboutMe);
  collectUrls(sourceData.biography);

  console.log(`\n=== Step 2: Uploading ${urlMap.size} images directly to bbb.bz R2 Bucket (${CDN_BBB}) ===`);
  for (const remoteUrl of urlMap.keys()) {
    try {
      const extMatch = remoteUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
      const filename = `about_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const r2Key = `uploads/acxuantai/${filename}`;

      console.log(`Downloading & Uploading to R2: ${remoteUrl}`);
      const buffer = await downloadBuffer(remoteUrl);
      const mime = getMimeType(remoteUrl);

      // Upload to R2
      const r2CdnUrl = await uploadToR2(buffer, r2Key, mime);
      console.log(` ✅ R2 CDN: ${r2CdnUrl}`);
      urlMap.set(remoteUrl, r2CdnUrl);

      // Save local backup file
      fs.writeFileSync(path.join(localUploadDir, filename), buffer);
      fs.writeFileSync(path.join(publicUploadDir, filename), buffer);
    } catch (e) {
      console.error(` ❌ Error processing image ${remoteUrl}:`, e.message);
    }
  }

  function replaceUrls(obj) {
    if (!obj) return obj;
    if (typeof obj === 'string') {
      return urlMap.get(obj) || obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(replaceUrls);
    }
    if (typeof obj === 'object') {
      const newObj = {};
      for (const k in obj) {
        newObj[k] = replaceUrls(obj[k]);
      }
      return newObj;
    }
    return obj;
  }

  const r2AboutMe = replaceUrls(sourceData.aboutMe);
  const r2Biography = replaceUrls(sourceData.biography);

  console.log('\n=== Step 3: Creating bbb.bz specific data_acxuantai.json with R2 CDN links ===');
  const bbbDataPath = path.join(process.cwd(), 'data_acxuantai_bbb.json');
  
  // Read current local data_acxuantai.json base
  let bbbData = {};
  if (fs.existsSync(path.join(process.cwd(), 'data_acxuantai.json'))) {
    bbbData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data_acxuantai.json'), 'utf-8'));
  }

  bbbData.aboutMe = r2AboutMe;
  bbbData.biography = r2Biography;
  if (sourceData.menus) bbbData.menus = sourceData.menus;

  fs.writeFileSync(bbbDataPath, JSON.stringify(bbbData, null, 2), 'utf-8');
  console.log(`Saved bbb.bz data file: data_acxuantai_bbb.json (${fs.statSync(bbbDataPath).size} bytes).`);

  console.log('\n=== Step 4: Deploying ONLY to bbb.bz VPS (36.50.177.253 / tài.com) ===');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '36.50.177.253',
      port: 22,
      username: 'root',
      password: 'MatKhauDay123',
      readyTimeout: 30000
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const remoteDataFile = '/home/bbb/htdocs/bbb.bz/data_acxuantai.json';
  await new Promise((res, rej) => sftp.fastPut(bbbDataPath, remoteDataFile, err => err ? rej(err) : res()));
  console.log(` [bbb.bz VPS] Uploaded data_acxuantai.json with R2 CDN links (${CDN_BBB})`);

  // Upload local fallback images
  const remoteUploadsDir = '/home/bbb/htdocs/bbb.bz/uploads/acxuantai';
  await new Promise(res => conn.exec(`mkdir -p ${remoteUploadsDir}`, res));
  const localImages = fs.readdirSync(localUploadDir);
  for (const img of localImages) {
    const srcPath = path.join(localUploadDir, img);
    const destPath = `${remoteUploadsDir}/${img}`;
    await new Promise((res, rej) => sftp.fastPut(srcPath, destPath, err => err ? rej(err) : res()));
  }
  console.log(` [bbb.bz VPS] Uploaded ${localImages.length} local image backups to ${remoteUploadsDir}`);

  // Restart PM2 demonhac on bbb.bz ONLY
  await new Promise((resolve) => {
    conn.exec('pm2 restart demonhac', (err, stream) => {
      if (err) return resolve();
      stream.on('close', resolve);
    });
  });
  console.log(' [bbb.bz VPS] Restarted PM2 [demonhac]');

  conn.end();
  console.log('\n🎉 SUCCESS! tài.com on bbb.bz now has full About Me data with Cloudflare R2 International CDN links (https://cdn.bbb.bz)!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
