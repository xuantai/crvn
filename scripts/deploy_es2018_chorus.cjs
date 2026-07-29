const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Transpiling server.ts to ES2018...');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn

    echo "=== REBUILDING WITH ES2018 TARGET ==="
    npx esbuild server.ts --bundle --platform=node --target=es2018 --format=cjs --packages=external --outfile=dist/server.cjs

    echo "=== STARTING PM2 PROCESS CHORUSVN ==="
    pm2 delete chorusvn 2>/dev/null || true
    PORT=3000 NODE_ENV=production pm2 start dist/server.cjs --name "chorusvn" --update-env
    pm2 save

    echo "=== CHECKING PM2 STATUS & LOGS ==="
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
