const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
  console.log('=== Connecting to VPS 36.50.177.253 ===');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH connected.\n');

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

  // 1. Upload dist/index.html
  console.log('=== Uploading dist/index.html ===');
  await uploadFile(path.join(ROOT, 'dist', 'index.html'), `${REMOTE_DIR}/dist/index.html`);

  // 2. Upload dist/assets/*
  console.log('\n=== Uploading dist/assets/ ===');
  await execCmd(`mkdir -p ${REMOTE_DIR}/dist/assets`);
  const assets = fs.readdirSync(path.join(ROOT, 'dist', 'assets'));
  for (const f of assets) {
    await uploadFile(path.join(ROOT, 'dist', 'assets', f), `${REMOTE_DIR}/dist/assets/${f}`);
  }

  // 3. Upload dist/server.cjs (backend)
  console.log('\n=== Uploading dist/server.cjs ===');
  await uploadFile(path.join(ROOT, 'dist', 'server.cjs'), `${REMOTE_DIR}/dist/server.cjs`);

  // 4. Upload Data JSONs & SQLite DB
  console.log('\n=== Uploading Data JSONs & SQLite DB ===');
  const files = fs.readdirSync(ROOT);
  for (const f of files) {
    if (f.endsWith('.json') || f.endsWith('.db')) {
      const fullPath = path.join(ROOT, f);
      if (fs.statSync(fullPath).isFile()) {
        await uploadFile(fullPath, `${REMOTE_DIR}/${f}`);
      }
    }
  }

  // 5. Restart PM2
  console.log('\n=== Restarting PM2 (demonhac) ===');
  await execCmd('pm2 restart demonhac && pm2 save');

  conn.end();
  console.log('\n🎉 Deploy hoàn tất! Site đã được cập nhật đầy đủ mã nguồn và dữ liệu.');
}

main().catch(err => {
  console.error('❌ Deploy thất bại:', err.message);
  process.exit(1);
});
