const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Uploading full dist directory...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    // 1. Upload dist/index.html
    sftp.fastPut(
      path.join(__dirname, '..', 'dist', 'index.html'),
      '/home/chorus/htdocs/chorus.vn/dist/index.html',
      (err) => {
        if (err) console.error('Error uploading index.html:', err);
        else console.log('✅ Uploaded dist/index.html');

        // 2. Read assets directory
        const assetsLocalDir = path.join(__dirname, '..', 'dist', 'assets');
        const assetsFiles = fs.readdirSync(assetsLocalDir);

        sftp.mkdir('/home/chorus/htdocs/chorus.vn/dist/assets', () => {
          let count = 0;
          assetsFiles.forEach(file => {
            sftp.fastPut(
              path.join(assetsLocalDir, file),
              `/home/chorus/htdocs/chorus.vn/dist/assets/${file}`,
              (err) => {
                count++;
                if (err) console.error(`Error uploading asset ${file}:`, err);
                else console.log(`✅ Uploaded dist/assets/${file}`);

                if (count === assetsFiles.length) {
                  console.log('✅ All frontend assets uploaded!');
                  const cmd = `
                    pm2 restart chorusvn
                    echo "PM2 chorusvn restarted!"
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
              }
            );
          });
        });
      }
    );
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
