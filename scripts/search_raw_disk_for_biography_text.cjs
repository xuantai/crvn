const { Client } = require('ssh2');

function searchVPS(host, password, serverName) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`\n========================================`);
      console.log(`🔍 DEEP SEARCHING RAW DISK ON ${serverName} [${host}]`);
      console.log(`========================================`);

      const cmd = `
        echo "=== 1. CHECKING PM2 LOGS & SYSTEM LOGS ==="
        grep -rn "1783955" /root/.pm2/logs/ /var/log/ 2>/dev/null | head -n 30 || true

        echo "=== 2. CHECKING ALL .JSON AND .TXT FILES IN /home AND /tmp ==="
        grep -rn "1783955" /home /tmp /var/www /var/log 2>/dev/null | grep -v "node_modules" | grep -v "dist/assets" | head -n 30 || true

        echo "=== 3. SEARCHING FOR ANY FILE CONTAINING SW69L6795GO WITH IMAGEURLS ==="
        grep -rn "imageUrls" /home /tmp 2>/dev/null | grep -v "node_modules" | grep -v "dist/assets" | grep "sw69l6795go" | head -n 30 || true
      `;

      conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.on('stderr', d => out += d.toString());
        stream.on('close', () => {
          console.log(out);
          conn.end();
          resolve();
        });
      });
    }).connect({
      host,
      port: 22,
      username: 'root',
      password,
      readyTimeout: 30000
    });
  });
}

async function run() {
  await searchVPS('160.187.147.125', 'MatKhauDay123@', 'CHORUS VPS 160');
  await searchVPS('36.50.177.253', 'MatKhauDay123', 'BBB VPS 36');
}

run();
