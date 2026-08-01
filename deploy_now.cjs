const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname; // f:/code/git/crvn

const SSH_CONFIG = {
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
};

const REMOTE_DIR = '/home/bbb/htdocs/bbb.bz';

async function main() {
  console.log('🎯 Deploying clean build to BBB.BZ VPS (36.50.177.253)...');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH connected to BBB.BZ VPS.\n');

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

  // Clean remote dist directory first to purge old assets
  console.log('=== Cleaning remote dist directory ===');
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

  // 5. Restart PM2 on bbb.bz (demonhac) on PORT 3333
  console.log('\n=== Step 5: Restarting PM2 process (demonhac) on PORT 3333 ===');
  await execCmd('pm2 delete demonhac || true');
  await execCmd(`cd ${REMOTE_DIR} && PORT=3333 NODE_ENV=production pm2 start dist/server.cjs --name "demonhac" --update-env && pm2 save`);

  conn.end();
  console.log('\n🎉 Deploy BBB.BZ hoàn tất! Site đã được cập nhật đầy đủ mã nguồn và dữ liệu mới nhất.');
}

main().catch(err => {
  console.error('❌ Deploy BBB.BZ thất bại:', err.message);
  process.exit(1);
});
