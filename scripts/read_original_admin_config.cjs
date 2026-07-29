const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  const cmd = `cat /home/acxuantai/htdocs/acxuantai.com/records/admin_config.json`;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', () => {
      console.log('=== RAW FILE FROM /home/acxuantai/htdocs/acxuantai.com/records/admin_config.json ===');
      console.log(out);
      fs.writeFileSync('original_admin_config.json', out);
      conn.end();
    });
  });
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
