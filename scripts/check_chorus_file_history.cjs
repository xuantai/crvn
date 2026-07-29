const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('=== CHECKING PM2 LOG TIMESTAMPS ON CHORUS VPS [160.187.147.125] ===');

  const cmd = `
    echo "=== PM2 LOG FILES ON CHORUS VPS ==="
    ls -l --time-style=full-iso /root/.pm2/logs/ 2>/dev/null || true

    echo "=== SEARCHING FOR PREVIOUS SYNC OR SAVE LOG LINES ==="
    grep -i "sync" /root/.pm2/logs/* 2>/dev/null | head -n 30 || true
    grep -i "acxuantai" /root/.pm2/logs/* 2>/dev/null | head -n 30 || true

    echo "=== SYSTEM BACKUP DIRECTORIES IF ANY ==="
    ls -la /var/backup/ /home/backup/ /root/backup/ 2>/dev/null || true
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
