const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Deploying full site & backend...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    // 1. Upload dist/server.cjs
    const localServer = path.join(rootDir, 'dist', 'server.cjs');
    const remoteServer = '/home/chorus/htdocs/chorus.vn/dist/server.cjs';

    console.log(`Uploading ${localServer} -> ${remoteServer}`);
    sftp.fastPut(localServer, remoteServer, (err) => {
      if (err) console.error('Error uploading server.cjs:', err);
      else console.log('✅ Uploaded dist/server.cjs');

      // 2. Upload dist/index.html
      const localIndex = path.join(rootDir, 'dist', 'index.html');
      const remoteIndex = '/home/chorus/htdocs/chorus.vn/dist/index.html';
      sftp.fastPut(localIndex, remoteIndex, (err) => {
        if (err) console.error('Error uploading index.html:', err);
        else console.log('✅ Uploaded dist/index.html');

        // 3. Upload dist/assets/*
        const assetsLocalDir = path.join(rootDir, 'dist', 'assets');
        const assetsFiles = fs.readdirSync(assetsLocalDir);

        sftp.mkdir('/home/chorus/htdocs/chorus.vn/dist/assets', () => {
          let count = 0;
          if (assetsFiles.length === 0) finish();

          assetsFiles.forEach(file => {
            sftp.fastPut(
              path.join(assetsLocalDir, file),
              `/home/chorus/htdocs/chorus.vn/dist/assets/${file}`,
              (err) => {
                count++;
                if (err) console.error(`Error uploading asset ${file}:`, err);
                else console.log(`✅ Uploaded dist/assets/${file}`);

                if (count === assetsFiles.length) {
                  finish();
                }
              }
            );
          });
        });
      });
    });

    function finish() {
      console.log('✅ All build files uploaded successfully! Restarting PM2 process...');
      const cmd = `
        cd /home/chorus/htdocs/chorus.vn
        pm2 restart chorusvn || PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
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
    }
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
