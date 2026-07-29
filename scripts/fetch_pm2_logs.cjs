const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO VPS (36.50.177.253) - Fetching PM2 Logs...');

  const cmd = `
    echo "=== PM2 STATUS ==="
    pm2 status

    echo "=== PM2 DEMONHAC LOGS (LAST 50 LINES) ==="
    pm2 logs demonhac --lines 50 --nostream

    echo "=== NGINX ERROR LOG (LAST 30 LINES) ==="
    tail -n 30 /var/log/nginx/error.log 2>/dev/null || true
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
  readyTimeout: 30000
});
