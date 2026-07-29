const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('=== CHECKING LANDING_CONFIG.JSON ON VPS 1 (bbb.bz) ===');
  const cmd = `
    cat /home/bbb/htdocs/bbb.bz/landing_config.json 2>/dev/null
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
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 15000
});
