const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn

    echo "=== CHECKING IF DIST OR BUILD EXISTS ==="
    ls -la dist/ 2>/dev/null || true

    echo "=== BUILDING DIST FOR CHORUS IF NEEDED ==="
    cmd /c "npm run build" 2>/dev/null || npm run build 2>/dev/null || npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs 2>/dev/null || true

    echo "=== STARTING PM2 WITH PORT 3000 ==="
    pm2 delete chorusvn 2>/dev/null || true
    PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
    pm2 save

    echo "=== VERIFYING PORT 3000 LISTENING ==="
    sleep 3
    netstat -tlpn | grep 3000 || ss -tlpn | grep 3000 || true
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
