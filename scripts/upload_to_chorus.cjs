const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

function uploadDir(sftp, localDir, remoteDir, callback) {
  sftp.mkdir(remoteDir, () => {
    const files = fs.readdirSync(localDir);
    let pending = files.length;
    if (!pending) return callback();

    files.forEach(file => {
      const localPath = path.join(localDir, file);
      const remotePath = remoteDir + '/' + file;
      const stat = fs.statSync(localPath);

      if (stat.isDirectory()) {
        uploadDir(sftp, localPath, remotePath, () => {
          if (!--pending) callback();
        });
      } else {
        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) console.error(`Error uploading ${file}:`, err);
          else console.log(`Uploaded ${file}`);
          if (!--pending) callback();
        });
      }
    });
  });
}

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Uploading dist directory...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    const localDist = path.join(__dirname, '..', 'dist');
    const remoteDist = '/home/chorus/htdocs/chorus.vn/dist';

    uploadDir(sftp, localDist, remoteDist, () => {
      console.log('✅ Uploaded full dist directory successfully to Chorus VPS!');

      const cmd = `
        pm2 delete chorusvn 2>/dev/null || true
        cd /home/chorus/htdocs/chorus.vn
        PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
        pm2 save

        echo "=== PM2 STATUS ==="
        sleep 2
        pm2 status
      `;

      conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.on('stderr', d => out += d.toString());
        stream.on('close', () => {
          console.log(out);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
