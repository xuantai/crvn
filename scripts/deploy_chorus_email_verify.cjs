const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

async function deployChorus() {
  console.log('🚀 Deploying Email Verification to VPS chorus.vn (160.187.147.125)...');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '160.187.147.125',
      port: 22,
      username: 'root',
      password: 'MatKhauDay123@',
      readyTimeout: 30000
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const remoteBase = '/home/chorus/htdocs/chorus.vn';

  // Helper to upload directory recursively
  async function uploadDir(localDir, remoteDir) {
    await new Promise(res => conn.exec(`mkdir -p ${remoteDir}`, res));
    const files = fs.readdirSync(localDir);
    for (const f of files) {
      const localPath = path.join(localDir, f);
      const remotePath = `${remoteDir}/${f}`;
      const stat = fs.statSync(localPath);
      if (stat.isDirectory()) {
        await uploadDir(localPath, remotePath);
      } else {
        await new Promise((res, rej) => sftp.fastPut(localPath, remotePath, err => err ? rej(err) : res()));
      }
    }
  }

  // Upload dist/
  console.log('📦 Uploading dist/ folder...');
  await uploadDir(path.join(process.cwd(), 'dist'), `${remoteBase}/dist`);
  console.log('✅ Uploaded dist/');

  // Upload server.ts
  console.log('📄 Uploading server.ts...');
  await new Promise((res, rej) => sftp.fastPut(path.join(process.cwd(), 'server.ts'), `${remoteBase}/server.ts`, err => err ? rej(err) : res()));
  console.log('✅ Uploaded server.ts');

  // Restart PM2
  console.log('🔄 Restarting PM2 [chorusvn]...');
  await new Promise(resolve => {
    conn.exec('source ~/.bashrc 2>/dev/null; source ~/.nvm/nvm.sh 2>/dev/null; pm2 restart chorusvn || /root/.nvm/versions/node/$(ls /root/.nvm/versions/node 2>/dev/null | tail -n 1)/bin/pm2 restart chorusvn', (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return resolve();
      }
      stream.on('data', (data) => console.log('PM2 STDOUT:', data.toString()));
      stream.stderr.on('data', (data) => console.error('PM2 STDERR:', data.toString()));
      stream.on('close', () => {
        console.log('✅ PM2 restart stream closed');
        resolve();
      });
    });
  });
  console.log('✅ Restarted PM2 [chorusvn]');

  conn.end();
  console.log('\n🎉 SUCCESS! Deploy to chorus.vn complete!');
  process.exit(0);
}

deployChorus().catch(err => {
  console.error('❌ Deploy Error:', err);
  process.exit(1);
});
