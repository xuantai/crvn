const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    echo "=== LSOF FOR PID 3995 ==="
    lsof -p 3995

    echo "=== NETSTAT FOR 3995 ==="
    netstat -tlpn | grep 3995 || true

    echo "=== PM2 LOGS (LAST 40 LINES) ==="
    tail -n 40 /root/.pm2/logs/chorusvn-out.log
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
