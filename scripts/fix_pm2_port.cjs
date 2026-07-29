const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO VPS (36.50.177.253) - Fixing PM2 Port & Nginx Config...');

  const cmd = `
    echo "=== CHECKING NGINX PROXY PORTS FOR BBB.BZ AND TAI.COM ==="
    grep -rn "proxy_pass" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null

    echo "=== CHECKING PORTS CURRENTLY LISTENING ON VPS ==="
    netstat -tlpn 2>/dev/null || ss -tlpn 2>/dev/null

    echo "=== STARTING DEMONHAC WITH PORT=3333 AND PORT=3000 ENV ==="
    pm2 delete demonhac 2>/dev/null || true
    cd /home/bbb/htdocs/bbb.bz
    PORT=3333 pm2 start dist/server.cjs --name "demonhac" --update-env
    pm2 save
    
    echo "=== PM2 LOGS AFTER FIX ==="
    sleep 3
    pm2 logs demonhac --lines 20 --nostream
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
