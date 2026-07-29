const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn
    echo "=== KILLING ANY OLD PROCESSES ==="
    pm2 delete chorusvn 2>/dev/null || true

    echo "=== STARTING SERVER IN BACKGROUND ==="
    PORT=3000 NODE_ENV=production node dist/server.cjs > /tmp/server.log 2>&1 &
    PID=$!

    echo "Started PID: $PID"
    sleep 3

    echo "=== SERVER LOG (/tmp/server.log) ==="
    cat /tmp/server.log

    echo "=== LISTENING PORTS FOR PID $PID ==="
    netstat -tlpn | grep $PID || true

    echo "=== CURL HEALTH ==="
    curl -i http://127.0.0.1:3000/api/health || true

    kill $PID 2>/dev/null || true
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
