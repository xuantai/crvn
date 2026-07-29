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
  console.log('=== Bắt đầu Chuẩn bị & Đồng bộ Database SQLite Độc lập cho Chorus.vn ===');
  
  const localDb = path.join(__dirname, '..', 'bbb_global.db');
  if (!fs.existsSync(localDb)) {
    console.error('❌ Không tìm thấy file bbb_global.db local');
    process.exit(1);
  }
  console.log(`✅ Đã tìm thấy local SQLite DB: ${localDb} (${fs.statSync(localDb).size} bytes)`);

  console.log('\n=== Kết nối tới VPS Chorus.vn (160.187.147.125) ===');
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ Đã kết nối SSH thành công tới Chorus VPS!');

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

  console.log('\n=== Tải file SQLite Database & Data JSON lên Chorus VPS ===');
  await uploadFile(localDb, `${REMOTE_DIR}/bbb_global.db`);

  const rootDataFiles = [
    'data_acxuantai.json',
    'landing_config.json',
    'original_admin_config.json',
    'artists.json',
    'tickets.json'
  ];

  for (const filename of rootDataFiles) {
    const localPath = path.join(__dirname, '..', filename);
    if (fs.existsSync(localPath)) {
      await uploadFile(localPath, `${REMOTE_DIR}/${filename}`);
    }
  }

  console.log('\n=== Cập nhật cấu hình Domain PLATFORM_DOMAIN=chorus.vn ===');
  const envContent = `PLATFORM_DOMAIN=chorus.vn
DEFAULT_LANGUAGE=vi
DEFAULT_CURRENCY=VND
PAYMENT_PROVIDER=stripe
`;
  const remoteEnvPath = `${REMOTE_DIR}/.env`;
  await execCmd(`cat << 'EOF' > ${remoteEnvPath}\n${envContent}\nEOF`);
  console.log('✅ Đã cập nhật file .env trên Chorus VPS');

  console.log('\n=== Dọn dẹp các script dư thừa trên Chorus VPS vào thư mục scripts/ ===');
  const cleanupCmd = `
    cd ${REMOTE_DIR} &&
    mkdir -p scripts &&
    find . -maxdepth 1 -name '*.cjs' ! -name 'ecosystem.config.cjs' -exec mv {} scripts/ \\; 2>/dev/null &&
    find . -maxdepth 1 -name '*.py' -exec mv {} scripts/ \\; 2>/dev/null &&
    find . -maxdepth 1 -name '*.sh' -exec mv {} scripts/ \\; 2>/dev/null &&
    find . -maxdepth 1 -name 'lint*.txt' -exec mv {} scripts/ \\; 2>/dev/null &&
    find . -maxdepth 1 -name 'tmp*.txt' -exec mv {} scripts/ \\; 2>/dev/null || true
  `;
  await execCmd(cleanupCmd);
  console.log('✅ Đã dọn dẹp thư mục root của Chorus VPS');

  console.log('\n=== Đặt lại quyền sở hữu & Khởi động lại dịch vụ Chorus.vn trên PM2 ===');
  await execCmd(`chown -R chorus:chorus ${REMOTE_DIR} || true`);
  const pm2Restart = await execCmd('pm2 restart chorus || pm2 restart all');
  console.log('PM2 restart output:\n', pm2Restart);

  conn.end();
  console.log('\n✅ HOÀN THÀNH: Database SQLite & Cấu hình độc lập cho Chorus.vn đã sẵn sàng!');
}

main().catch(err => {
  console.error('❌ Lỗi thực thi:', err);
  process.exit(1);
});
