const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Inspecting 502 Bad Gateway cause...');

  const cmd = `
    echo "=== 1. PM2 STATUS ==="
    pm2 status

    echo "=== 2. PM2 RECENT ERROR LOGS ==="
    tail -n 30 /root/.pm2/logs/chorusvn-error.log 2>/dev/null || true

    echo "=== 3. PM2 RECENT OUT LOGS ==="
    tail -n 30 /root/.pm2/logs/chorusvn-out.log 2>/dev/null || true

    echo "=== 4. CURL LOCAL PORT 3000 ==="
    curl -v http://127.0.0.1:3000/ 2>&1 | head -n 30

    echo "=== 5. NGINX ERROR LOG ==="
    tail -n 30 /home/chorus/logs/nginx/error.log 2>/dev/null || tail -n 30 /var/log/nginx/error.log 2>/dev/null || true

    echo "=== 6. NGINX SITES-ENABLED CONFIG ==="
    cat /etc/nginx/sites-enabled/* 2>/dev/null || true
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
