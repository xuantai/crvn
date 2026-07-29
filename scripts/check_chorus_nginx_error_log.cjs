const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Reading Nginx Error Log...');

  const cmd = `
    echo "=== NGINX ERROR LOG ==="
    tail -n 30 /home/chorus/logs/nginx/error.log 2>/dev/null || tail -n 30 /var/log/nginx/error.log

    echo "=== CURL DIRECT TO PORT 3000 FROM VPS ==="
    curl -I http://127.0.0.1:3000
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
