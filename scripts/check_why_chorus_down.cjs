const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Fixing Chorus Service...');

  const cmd = `
    echo "=== 1. PM2 STATUS ==="
    pm2 status

    echo "=== 2. CHORUS ERROR LOGS ==="
    pm2 logs chorusvn --lines 30 --nostream

    echo "=== 3. RESTARTING CHORUSVN IN PRODUCTION MODE ==="
    cd /home/chorus/htdocs/chorus.vn
    NODE_ENV=production pm2 restart chorusvn --update-env 2>/dev/null || NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
    pm2 save

    echo "=== 4. TESTING CHORUS API ==="
    sleep 3
    curl -I http://127.0.0.1:3000/api/data
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
