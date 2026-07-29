const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { Client } = require('ssh2');

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

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('=== Step 1: Fetching full acxuantai data from tài.vn (chorus.vn) ===');
  const sourceData = await getJson('https://chorus.vn/api/data?artist=acxuantai');
  if (!sourceData || !sourceData.aboutMe) {
    throw new Error('Failed to fetch valid aboutMe data from chorus.vn');
  }

  console.log('Fetched aboutMe and biography successfully!');

  const localUploadDir = path.join(process.cwd(), 'uploads', 'acxuantai');
  const publicUploadDir = path.join(process.cwd(), 'public', 'uploads', 'acxuantai');
  const distUploadDir = path.join(process.cwd(), 'dist', 'uploads', 'acxuantai');

  [localUploadDir, publicUploadDir, distUploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const urlMap = new Map();

  function collectUrls(obj) {
    if (!obj) return;
    if (typeof obj === 'string') {
      if ((obj.startsWith('http://') || obj.startsWith('https://')) && !urlMap.has(obj)) {
        if (obj.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || obj.includes('firebasestorage') || obj.includes('acxuantai.com') || obj.includes('chorus.vn')) {
          const extMatch = obj.match(/\.(jpg|jpeg|png|webp|gif|svg)/i);
          const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
          const filename = `about_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
          urlMap.set(obj, `/uploads/acxuantai/${filename}`);
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

  console.log(`\n=== Step 2: Downloading ${urlMap.size} images locally ===`);
  for (const [remoteUrl, localRelPath] of urlMap.entries()) {
    const filename = path.basename(localRelPath);
    const targetFile = path.join(localUploadDir, filename);
    const publicFile = path.join(publicUploadDir, filename);
    const distFile = path.join(distUploadDir, filename);

    console.log(`Downloading: ${remoteUrl} -> ${filename}`);
    try {
      await downloadFile(remoteUrl, targetFile);
      fs.copyFileSync(targetFile, publicFile);
      fs.copyFileSync(targetFile, distFile);
    } catch (e) {
      console.error(` ❌ Warning: Failed to download ${remoteUrl}:`, e.message);
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

  const cleanAboutMe = replaceUrls(sourceData.aboutMe);
  const cleanBiography = replaceUrls(sourceData.biography);

  console.log('\n=== Step 3: Updating local data_acxuantai.json ===');
  const localDataPath = path.join(process.cwd(), 'data_acxuantai.json');
  let localData = {};
  if (fs.existsSync(localDataPath)) {
    localData = JSON.parse(fs.readFileSync(localDataPath, 'utf-8'));
  }

  localData.aboutMe = cleanAboutMe;
  localData.biography = cleanBiography;
  if (sourceData.menus) localData.menus = sourceData.menus;

  fs.writeFileSync(localDataPath, JSON.stringify(localData, null, 2), 'utf-8');
  console.log(`Updated data_acxuantai.json successfully (${fs.statSync(localDataPath).size} bytes).`);

  console.log('\n=== Step 4: Syncing data_acxuantai.json & images to VPS servers ===');

  async function uploadToVps(vps) {
    console.log(`Connecting to SSH ${vps.host}...`);
    const conn = new Client();
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve).on('error', reject).connect({
        host: vps.host,
        port: vps.port,
        username: vps.username,
        password: vps.password,
        readyTimeout: 30000
      });
    });

    const sftp = await new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
    });

    const remoteUploadsDir = `${vps.remoteDir}/uploads/acxuantai`;
    await new Promise(res => conn.exec(`mkdir -p ${remoteUploadsDir}`, res));

    // Upload data_acxuantai.json
    const remoteDataFile = `${vps.remoteDir}/data_acxuantai.json`;
    await new Promise((res, rej) => sftp.fastPut(localDataPath, remoteDataFile, err => err ? rej(err) : res()));
    console.log(` [${vps.host}] Uploaded data_acxuantai.json`);

    // Upload images
    const imageFiles = fs.readdirSync(localUploadDir);
    for (const img of imageFiles) {
      const srcPath = path.join(localUploadDir, img);
      const destPath = `${remoteUploadsDir}/${img}`;
      await new Promise((res, rej) => sftp.fastPut(srcPath, destPath, err => err ? rej(err) : res()));
    }
    console.log(` [${vps.host}] Uploaded ${imageFiles.length} images to ${remoteUploadsDir}`);

    // Restart PM2
    try {
      await new Promise((resolve, reject) => {
        conn.exec(`pm2 restart ${vps.pm2Name}`, (err, stream) => {
          if (err) return reject(err);
          stream.on('close', resolve);
        });
      });
      console.log(` [${vps.host}] Restarted PM2 [${vps.pm2Name}]`);
    } catch (e) {}

    conn.end();
  }

  const VPS_BBB = { host: '36.50.177.253', port: 22, username: 'root', password: 'MatKhauDay123', remoteDir: '/home/bbb/htdocs/bbb.bz', pm2Name: 'demonhac' };
  const VPS_CHORUS = { host: '160.187.147.125', port: 22, username: 'root', password: 'MatKhauDay123@', remoteDir: '/home/chorus/htdocs/chorus.vn', pm2Name: 'chorusvn' };

  await uploadToVps(VPS_BBB);
  await uploadToVps(VPS_CHORUS);

  console.log('\n🎉 ALL DONE! tài.com and tài.vn are now 100% in sync with local images!');
}

main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
