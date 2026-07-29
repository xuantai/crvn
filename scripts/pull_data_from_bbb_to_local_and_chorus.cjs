const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS1_CONFIG = {
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 15000
};

const CHORUS_VPS_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 15000
};

async function main() {
  console.log('=== Bắt đầu Đồng bộ Dữ liệu Mới nhất từ bbb.bz VPS về Local & Chorus.vn ===');

  // Step 1: Connect to VPS 1 (bbb.bz) and download latest bbb_global.db and data files to local
  console.log('\n=== Step 1: Kéo dữ liệu mới nhất từ bbb.bz (36.50.177.253) về Local ===');
  const conn1 = new Client();
  await new Promise((resolve, reject) => {
    conn1.on('ready', resolve).on('error', reject).connect(VPS1_CONFIG);
  });
  console.log('✅ Đã kết nối SSH tới VPS 1 (bbb.bz)');

  const sftp1 = await new Promise((resolve, reject) => {
    conn1.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const downloadFile = (remotePath, localPath) => new Promise((resolve, reject) => {
    sftp1.fastGet(remotePath, localPath, (err) => {
      if (err) return reject(err);
      console.log(`Downloaded: ${remotePath} -> ${path.basename(localPath)}`);
      resolve();
    });
  });

  const rootDir = path.join(__dirname, '..');

  const filesToPull = [
    'bbb_global.db',
    'data_acxuantai.json',
    'original_admin_config.json',
    'vouchers.json',
    'artists.json',
    'tickets.json'
  ];

  for (const file of filesToPull) {
    const remoteFilePath = `/home/bbb/htdocs/bbb.bz/${file}`;
    const localFilePath = path.join(rootDir, file);
    try {
      await downloadFile(remoteFilePath, localFilePath);
    } catch (e) {
      console.log(`Skip file ${file} (không có trên VPS 1)`);
    }
  }
  conn1.end();
  console.log('✅ Đã cập nhật xong dữ liệu mới nhất về máy Local!');

  // Step 2: Push the updated DB and configs to Chorus VPS
  console.log('\n=== Step 2: Đẩy dữ liệu mới nhất sang Chorus.vn VPS (160.187.147.125) ===');
  const conn2 = new Client();
  await new Promise((resolve, reject) => {
    conn2.on('ready', resolve).on('error', reject).connect(CHORUS_VPS_CONFIG);
  });
  console.log('✅ Đã kết nối SSH tới Chorus VPS');

  const sftp2 = await new Promise((resolve, reject) => {
    conn2.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const uploadFile = (localPath, remotePath) => new Promise((resolve, reject) => {
    sftp2.fastPut(localPath, remotePath, (err) => {
      if (err) return reject(err);
      console.log(`Uploaded: ${path.basename(localPath)} -> ${remotePath}`);
      resolve();
    });
  });

  for (const file of filesToPull) {
    const localFilePath = path.join(rootDir, file);
    if (fs.existsSync(localFilePath)) {
      await uploadFile(localFilePath, `/home/chorus/htdocs/chorus.vn/${file}`);
    }
  }

  // Restart PM2 on Chorus VPS
  const execCmd2 = (cmd) => new Promise((resolve, reject) => {
    conn2.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('close', (code) => code === 0 ? resolve(out) : reject(new Error(out))).on('data', d => out += d.toString());
    });
  });

  await execCmd2('pm2 restart chorusvn');
  conn2.end();

  console.log('\n✅ HOÀN THÀNH: Đã đồng bộ thành công dữ liệu Bảng giá mới nhất từ bbb.bz về Local và đẩy lên Chorus.vn!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
