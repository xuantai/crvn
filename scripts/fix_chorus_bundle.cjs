const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Bundling server.ts with Node12 target...');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn

    echo "=== REBUILDING BUNDLE WITH ESBUILD TARGET NODE12 ==="
    npx esbuild server.ts --bundle --platform=node --target=node12 --format=cjs --packages=external --outfile=dist/server.cjs

    echo "=== RESTARTING PM2 PROCESS ==="
    pm2 delete chorusvn 2>/dev/null || true
    PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
    pm2 save

    echo "=== PM2 STATUS & LOGS ==="
    sleep 3
    pm2 status
    pm2 logs chorusvn --lines 20 --nostream
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
