const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    echo "=== SEARCHING FOR BACKUP FILES AND OTHER JSON/SQLITE FILES ON CHORUS VPS ==="
    find /home /root /tmp /var -name "*backup*" -o -name "*.tar.gz" -o -name "*.zip" -o -name "*.db" -o -name "*.json" 2>/dev/null | grep -v "node_modules" | head -n 100
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
