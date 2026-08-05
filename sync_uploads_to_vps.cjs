const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const LOCAL_UPLOADS = path.join(ROOT, 'public', 'uploads');
const REMOTE_UPLOADS = '/home/chorus/htdocs/chorus.vn/public/uploads';

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function main() {
  console.log('🚀 Syncing public/uploads directly to VPS disk...');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH connected to VPS.');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve)
        .on('data', d => process.stdout.write(d))
        .stderr.on('data', d => process.stderr.write(d));
    });
  });

  const allFiles = getAllFiles(LOCAL_UPLOADS);
  console.log(`📦 Found ${allFiles.length} files to sync.`);

  // Create base uploads directory on VPS
  await execCmd(`mkdir -p ${REMOTE_UPLOADS}`);

  // Create all subdirectories first
  const dirs = new Set();
  allFiles.forEach(f => {
    const relDir = path.dirname(path.relative(LOCAL_UPLOADS, f)).replace(/\\/g, '/');
    if (relDir && relDir !== '.') dirs.add(relDir);
  });

  for (const d of dirs) {
    await execCmd(`mkdir -p ${REMOTE_UPLOADS}/${d}`);
  }

  let count = 0;
  for (const localFile of allFiles) {
    const relPath = path.relative(LOCAL_UPLOADS, localFile).replace(/\\/g, '/');
    const remoteFile = `${REMOTE_UPLOADS}/${relPath}`;

    await new Promise((resolve, reject) => {
      sftp.fastPut(localFile, remoteFile, (err) => {
        if (err) {
          console.error(`❌ Error uploading ${relPath}:`, err.message);
          resolve();
        } else {
          count++;
          if (count % 50 === 0 || count === allFiles.length) {
            console.log(`  ✅ Synced [${count}/${allFiles.length}]: ${relPath}`);
          }
          resolve();
        }
      });
    });
  }

  conn.end();
  console.log(`\n🎉 VPS Upload Sync Complete! Uploaded ${count} files.`);
}

main().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
