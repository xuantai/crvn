const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Checking Nginx Port...');

  const cmd = `
    echo "=== NGINX CONFIG FOR CHORUS.VN ==="
    cat /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | grep -C 5 "chorus.vn"

    echo "=== PORTS CURRENTLY LISTENING ON CHORUS VPS ==="
    netstat -tlpn 2>/dev/null || ss -tlpn 2>/dev/null

    echo "=== PM2 STATUS ==="
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
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
