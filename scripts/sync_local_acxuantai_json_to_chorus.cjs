const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Uploading data_acxuantai.json...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    sftp.fastPut(
      path.join(__dirname, 'data_acxuantai.json'),
      '/home/chorus/htdocs/chorus.vn/data_acxuantai.json',
      (err) => {
        if (err) {
          console.error('SFTP Upload Error:', err);
          conn.end();
          return;
        }
        console.log('✅ Uploaded data_acxuantai.json successfully to Chorus VPS!');

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
    );
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
