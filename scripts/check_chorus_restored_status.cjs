const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Checking Restored App Status...');

  const cmd = `
    echo "=== 1. CHECKING PM2 STATUS ON CHORUS VPS ==="
    pm2 status

    echo "=== 2. CHECKING PM2 LOGS FOR chorusvn ==="
    pm2 logs chorusvn --lines 40 --nostream

    echo "=== 3. CHECKING NGINX STATUS & CONFIG ==="
    nginx -t
    systemctl status nginx --no-pager | head -n 20 || true

    echo "=== 4. CHECKING RESTORED data_acxuantai.json ==="
    node -e "
      const fs = require('fs');
      const p = '/home/chorus/htdocs/chorus.vn/data_acxuantai.json';
      if (fs.existsSync(p)) {
        const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
        console.log('aboutMe:', JSON.stringify(d.aboutMe, null, 2));
        console.log('biography:', JSON.stringify(d.biography, null, 2));
      } else {
        console.log('File not found:', p);
      }
    " 2>/dev/null || true
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
