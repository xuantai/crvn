const { Client } = require('ssh2');
const path = require('path');

const VPS_CHORUS = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  remoteDir: '/home/chorus/htdocs/chorus.vn'
};

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(VPS_CHORUS);
  });

  const execCmd = (cmd) => new Promise((resolve) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return resolve({ err: err.message });
      let out = '', errOut = '';
      stream.on('close', (code) => resolve({ out, errOut, code })).on('data', d => { out += d.toString(); }).stderr.on('data', d => { errOut += d.toString(); });
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const uploadFile = (localPath, remotePath) => new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const rootDir = path.join(__dirname, '..');
  await uploadFile(path.join(rootDir, 'scripts', 'sync_cheng.cjs'), `${VPS_CHORUS.remoteDir}/scripts/sync_cheng.cjs`);

  const nodeBin = '/root/.nvm/versions/node/v20.20.2/bin/node';
  console.log("⚡ Executing sync_cheng.cjs on VPS...");
  const res = await execCmd(`cd ${VPS_CHORUS.remoteDir} && ${nodeBin} scripts/sync_cheng.cjs`);
  console.log("SYNC STDOUT:\n", res.out);
  console.log("SYNC STDERR:\n", res.errOut);

  conn.end();
}

main();
