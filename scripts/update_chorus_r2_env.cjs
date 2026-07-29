const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

const REMOTE_DIR = '/home/chorus/htdocs/chorus.vn';

async function main() {
  console.log('=== Cập nhật R2 Storage & Mã nguồn mới nhất lên Chorus VPS ===');

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ Đã kết nối SSH tới Chorus VPS');

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(out);
        else reject(new Error(`Command "${cmd}" exited with code ${code}.\nSTDERR: ${errOut}\nSTDOUT: ${out}`));
      }).on('data', d => { out += d.toString(); }).stderr.on('data', d => { errOut += d.toString(); });
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const uploadFile = (localPath, remotePath) => new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) return reject(err);
      console.log(`Uploaded: ${path.basename(localPath)} -> ${remotePath}`);
      resolve();
    });
  });

  const ensureDir = (remotePath) => new Promise((resolve) => {
    sftp.mkdir(remotePath, () => resolve());
  });

  // 1. Update .env on Chorus VPS with R2 info from screenshot
  console.log('\n=== Step 1: Cập nhật .env với thông tin Cloudflare R2 ===');
  const envContent = `PLATFORM_DOMAIN=chorus.vn
DEFAULT_LANGUAGE=vi
DEFAULT_CURRENCY=VND
PAYMENT_PROVIDER=stripe

# Cloudflare R2 Storage Configuration
CF_R2_ACCOUNT_ID=ed5771d045bec5ae12373a1dc5bb6985
CF_R2_ACCESS_KEY_ID=de9a5a092fded5861a3c66dc384752e9
CF_R2_SECRET_ACCESS_KEY=d66bfcd930ae87db5ef6add59e18a784080de8b5be887f3f96aa4e84751cb564
CF_R2_BUCKET_NAME=chorus-vn
CF_R2_PUBLIC_DOMAIN=https://cdn.chorus.vn
`;

  await execCmd(`cat << 'EOF' > ${REMOTE_DIR}/.env\n${envContent}\nEOF`);
  console.log('✅ Đã cập nhật file .env với R2 Token mới');

  // 2. Upload latest compiled server & dist build
  console.log('\n=== Step 2: Tải code mới nhất (server.ts, dist/) lên Chorus VPS ===');
  const rootDir = path.join(__dirname, '..');
  
  await uploadFile(path.join(rootDir, 'server.ts'), `${REMOTE_DIR}/server.ts`);

  await ensureDir(`${REMOTE_DIR}/dist`);
  await ensureDir(`${REMOTE_DIR}/dist/assets`);

  const distFiles = fs.readdirSync(path.join(rootDir, 'dist'));
  for (const file of distFiles) {
    const fullPath = path.join(rootDir, 'dist', file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      await uploadFile(fullPath, `${REMOTE_DIR}/dist/${file}`);
    }
  }

  const assetsDir = path.join(rootDir, 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    for (const file of assetFiles) {
      await uploadFile(path.join(assetsDir, file), `${REMOTE_DIR}/dist/assets/${file}`);
    }
  }

  // 3. Restart PM2 on Chorus VPS
  console.log('\n=== Step 3: Restart PM2 ===');
  await execCmd(`chown -R chorus:chorus ${REMOTE_DIR} || true`);
  const pm2Restart = await execCmd('pm2 restart chorusvn || pm2 restart 0');
  console.log('PM2 restart output:\n', pm2Restart);

  conn.end();
  console.log('\n✅ HOÀN THÀNH 100%: Cloudflare R2 & Mã nguồn mới nhất đã được cập nhật thành công cho Chorus.vn!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
