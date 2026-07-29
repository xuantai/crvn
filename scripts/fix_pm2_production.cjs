const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO VPS (36.50.177.253) - Starting demonhac in PRODUCTION mode on PORT 3333...');

  const cmd = `
    pm2 delete demonhac 2>/dev/null || true
    cd /home/bbb/htdocs/bbb.bz
    NODE_ENV=production PORT=3333 pm2 start dist/server.cjs --name "demonhac" --update-env
    pm2 save
    
    echo "=== PM2 STATUS ==="
    pm2 status

    echo "=== PM2 LOGS AFTER FIX (LAST 25 LINES) ==="
    sleep 3
    pm2 logs demonhac --lines 25 --nostream
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
