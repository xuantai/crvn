const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname; // f:/code/git/crvn

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

const REMOTE_DIR = '/home/chorus/htdocs/chorus.vn';

async function main() {
  console.log('🎯 Deploying clean build to CHORUS.VN VPS (160.187.147.125)...');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH connected to CHORUS.VN VPS.\n');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        console.log(out || errOut);
        resolve(out);
      }).on('data', d => { out += d; process.stdout.write(d); })
        .stderr.on('data', d => { errOut += d; process.stderr.write(d); });
    });
  });

  const uploadFile = (localPath, remotePath) => new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) return reject(err);
      console.log(`  ✅ ${path.basename(localPath)}`);
      resolve();
    });
  });

  const downloadFile = (remotePath, localPath) => new Promise((resolve, reject) => {
    sftp.fastGet(remotePath, localPath, (err) => {
      if (err) return resolve(); // ignore if file doesn't exist remotely yet
      console.log(`  📥 Downloaded ${path.basename(localPath)} from live VPS`);
      resolve();
    });
  });

  // Step 0: Sync live data & databases from VPS to local first to preserve user edits!
  console.log('=== Step 0: Pulling live data & SQLite DB from VPS to prevent overwriting user edits ===');
  try {
    const remoteFiles = await new Promise((resolve, reject) => {
      sftp.readdir(REMOTE_DIR, (err, list) => err ? reject(err) : resolve(list));
    });
    for (const item of remoteFiles) {
      if (item.filename.endsWith('.json') || item.filename.endsWith('.db')) {
        await downloadFile(`${REMOTE_DIR}/${item.filename}`, path.join(ROOT, item.filename));
      }
    }
  } catch (e) {
    console.error('Warning syncing live data:', e.message);
  }

  // Clean remote dist directory first to purge old assets
  console.log('\n=== Cleaning remote dist directory ===');
  await execCmd(`rm -rf ${REMOTE_DIR}/dist && mkdir -p ${REMOTE_DIR}/dist/assets`);

  // 1. Upload dist/index.html
  console.log('\n=== Step 1: Uploading dist/index.html ===');
  await uploadFile(path.join(ROOT, 'dist', 'index.html'), `${REMOTE_DIR}/dist/index.html`);

  // 2. Upload dist/assets/*
  console.log('\n=== Step 2: Uploading dist/assets/ ===');
  const assets = fs.readdirSync(path.join(ROOT, 'dist', 'assets'));
  for (const f of assets) {
    await uploadFile(path.join(ROOT, 'dist', 'assets', f), `${REMOTE_DIR}/dist/assets/${f}`);
  }

  // 3. Upload dist/server.cjs
  console.log('\n=== Step 3: Uploading dist/server.cjs ===');
  await uploadFile(path.join(ROOT, 'dist', 'server.cjs'), `${REMOTE_DIR}/dist/server.cjs`);

  // 3b. Upload static root files (images from public/) that Vite copies to dist/
  console.log('\n=== Step 3b: Uploading dist/ root static files ===');
  const distRootFiles = fs.readdirSync(path.join(ROOT, 'dist'));
  const staticExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico', '.gif', '.mp4', '.webm'];
  for (const f of distRootFiles) {
    const ext = path.extname(f).toLowerCase();
    if (staticExts.includes(ext)) {
      await uploadFile(path.join(ROOT, 'dist', f), `${REMOTE_DIR}/dist/${f}`);
    }
  }

  // 3c. Sync public/uploads to VPS local disk for dual-backup
  console.log('\n=== Step 3c: Syncing public/uploads to VPS local disk ===');
  const syncUploadsDir = async (localDir, remoteDir) => {
    if (!fs.existsSync(localDir)) return;
    await execCmd(`mkdir -p "${remoteDir}"`);
    const items = fs.readdirSync(localDir);
    for (const item of items) {
      const lPath = path.join(localDir, item);
      const rPath = `${remoteDir}/${item}`;
      if (fs.statSync(lPath).isDirectory()) {
        await syncUploadsDir(lPath, rPath);
      } else {
        // Only upload if file doesn't exist remotely or is missing
        await uploadFile(lPath, rPath).catch(() => {});
      }
    }
  };
  await syncUploadsDir(path.join(ROOT, 'public', 'uploads'), `${REMOTE_DIR}/public/uploads`);

  // 4. Upload Data Files & SQLite DB
  console.log('\n=== Step 4: Uploading Data JSONs & SQLite DB ===');
  const files = fs.readdirSync(ROOT);
  for (const f of files) {
    if (f.endsWith('.json') || f.endsWith('.db')) {
      const fullPath = path.join(ROOT, f);
      if (fs.statSync(fullPath).isFile()) {
        await uploadFile(fullPath, `${REMOTE_DIR}/${f}`);
      }
    }
  }

  // 5. Restart PM2 on chorus.vn using Node.js v18 interpreter explicitly
  console.log('\n=== Step 5: Restarting PM2 process (chorusvn) with Node.js v18 ===');
  await execCmd('pm2 delete chorusvn || true');
  await execCmd(`cd ${REMOTE_DIR} && PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --interpreter /root/.nvm/versions/node/v18.20.8/bin/node --update-env && pm2 save`);

  conn.end();
  console.log('\n🎉 Deploy CHORUS.VN hoàn tất!');
}

main().catch(err => {
  console.error('❌ Deploy CHORUS.VN thất bại:', err.message);
  process.exit(1);
});
