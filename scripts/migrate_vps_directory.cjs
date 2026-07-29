const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO VPS (36.50.177.253) - Starting Migration to /home/bbb/htdocs/bbb.bz...');

  const cmd = `
    set -e
    echo "=== STEP 1: Creating target directory /home/bbb/htdocs/bbb.bz ==="
    mkdir -p /home/bbb/htdocs/bbb.bz

    echo "=== STEP 2: Copying data and source files ==="
    cp -r -n /home/tai/htdocs/tai/* /home/bbb/htdocs/bbb.bz/ 2>/dev/null || true
    cp -r -n /home/tai/htdocs/tai/.* /home/bbb/htdocs/bbb.bz/ 2>/dev/null || true

    echo "=== STEP 3: Updating Nginx Configurations ==="
    sed -i 's|/home/tai/htdocs/tai|/home/bbb/htdocs/bbb.bz|g' /etc/nginx/sites-available/* 2>/dev/null || true
    sed -i 's|/home/tai/htdocs/tai|/home/bbb/htdocs/bbb.bz|g' /etc/nginx/sites-enabled/* 2>/dev/null || true
    sed -i 's|/home/tai/htdocs/tai|/home/bbb/htdocs/bbb.bz|g' /etc/nginx/conf.d/* 2>/dev/null || true

    echo "=== STEP 4: Testing Nginx syntax ==="
    nginx -t

    echo "=== STEP 5: Reloading Nginx ==="
    systemctl reload nginx

    echo "=== STEP 6: Updating PM2 process demonhac ==="
    pm2 delete demonhac 2>/dev/null || true
    cd /home/bbb/htdocs/bbb.bz
    pm2 start dist/server.cjs --name "demonhac"
    pm2 save

    echo "=== MIGRATION COMPLETED SUCCESSFULLY ==="
  `;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', (code) => {
      console.log(out);
      if (code === 0) console.log('🎉 VPS migration finished cleanly with code 0!');
      else console.error('⚠️ VPS migration exited with code:', code);
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
