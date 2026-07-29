const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Testing Local Ports...');

  const cmd = `
    echo "=== NETSTAT ON VPS CHORUS ==="
    netstat -tlpn 2>/dev/null | grep -E "3000|3333|node" || true

    echo "=== CURL TO 3000 ==="
    curl -i http://127.0.0.1:3000/api/data 2>/dev/null | head -n 20 || true
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
