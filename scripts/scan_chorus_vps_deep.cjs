const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    echo "=== NGINX CONFIGS ON VPS 160.187.147.125 ==="
    cat /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | grep -E "server_name|root|proxy_pass"

    echo "=== PM2 PROCESSES ON VPS 160.187.147.125 ==="
    pm2 list 2>/dev/null || pm2-runtime list 2>/dev/null

    echo "=== ALL HOMES & WEB DIRS ==="
    ls -la /home/ /var/www/ /opt/ /root/ 2>/dev/null

    echo "=== SEARCHING FOR ACXUANTAI OR CHORUS KEYWORDS ON VPS 160.187.147.125 ==="
    grep -rnI "acxuantai" /home/ /var/www/ /opt/ /root/ 2>/dev/null | head -n 30
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
