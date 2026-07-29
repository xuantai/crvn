const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO BBB VPS [36.50.177.253] - Syncing data_acxuantai.json...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    sftp.fastPut(
      path.join(__dirname, 'data_acxuantai.json'),
      '/home/bbb/htdocs/bbb.bz/data_acxuantai.json',
      (err) => {
        if (err) console.error('SFTP upload error to BBB:', err);
        else console.log('✅ Uploaded data_acxuantai.json to BBB VPS!');

        conn.exec('pm2 restart demonhac', (err, stream) => {
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
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
