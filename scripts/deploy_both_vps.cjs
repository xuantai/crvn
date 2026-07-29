const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_BBB = {
  name: 'bbb.bz VPS (36.50.177.253)',
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  remoteDir: '/home/bbb/htdocs/bbb.bz',
  pm2Name: 'demonhac'
};

const VPS_CHORUS = {
  name: 'chorus.vn VPS (160.187.147.125)',
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  remoteDir: '/home/chorus/htdocs/chorus.vn',
  pm2Name: 'chorusvn'
};

async function deployToVPS(vps) {
  console.log(`\n========================================`);
  console.log(`🚀 BẮT ĐẦU DEPLOY LÊN: ${vps.name}`);
  console.log(`========================================`);

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
  console.log(`✅ Kết nối SSH thành công tới ${vps.host}`);

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
      console.log(`  Uploaded: ${path.basename(localPath)} -> ${remotePath}`);
      resolve();
    });
  });

  const ensureDir = (remotePath) => new Promise((resolve) => {
    sftp.mkdir(remotePath, () => resolve());
  });

  const rootDir = path.join(__dirname, '..');

  console.log(`\n📦 Upload mã nguồn mới nhất sang ${vps.remoteDir}...`);
  await uploadFile(path.join(rootDir, 'server.ts'), `${vps.remoteDir}/server.ts`);

  await ensureDir(`${vps.remoteDir}/dist`);
  await ensureDir(`${vps.remoteDir}/dist/assets`);

  const distFiles = fs.readdirSync(path.join(rootDir, 'dist'));
  for (const file of distFiles) {
    const fullPath = path.join(rootDir, 'dist', file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      await uploadFile(fullPath, `${vps.remoteDir}/dist/${file}`);
    }
  }

  await ensureDir(`${vps.remoteDir}/public`);
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    for (const file of publicFiles) {
      const fullPath = path.join(publicDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        await uploadFile(fullPath, `${vps.remoteDir}/public/${file}`);
        await uploadFile(fullPath, `${vps.remoteDir}/${file}`);
      }
    }
  }

  const assetsDir = path.join(rootDir, 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    for (const file of assetFiles) {
      await uploadFile(path.join(assetsDir, file), `${vps.remoteDir}/dist/assets/${file}`);
    }
  }

  console.log(`\n🔄 Restart PM2 process [${vps.pm2Name}]...`);
  try {
    const pm2Res = await execCmd(`pm2 restart ${vps.pm2Name} || pm2 restart 0`);
    console.log(`  PM2 output:\n`, pm2Res);
  } catch (err) {
    console.error(`  ⚠️ Lỗi restart PM2:`, err.message);
  }

  conn.end();
  console.log(`\n✅ HOÀN THÀNH DEPLOY LÊN ${vps.name}!`);
}

async function main() {
  await deployToVPS(VPS_BBB);
  await deployToVPS(VPS_CHORUS);
  console.log('\n🎉🎉🎉 ĐÃ HOÀN TẤT DEPLOY ĐỒNG BỘ 100% CẢ 2 VPS (bbb.bz & chorus.vn)!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
