const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Starting chorusvn on PORT 3000...');

  const cmd = `
    pm2 delete chorusvn 2>/dev/null || true
    cd /home/chorus/htdocs/chorus.vn
    NODE_ENV=production PORT=3000 pm2 start dist/server.cjs --name "chorusvn" --update-env
    pm2 save
    
    echo "=== PM2 STATUS ==="
    pm2 status

    echo "=== TESTING API ON PORT 3000 ==="
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
