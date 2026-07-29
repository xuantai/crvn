const { Client } = require('ssh2');

function checkServer(host, password, serverName) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`\n========================================`);
      console.log(`✅ SSH CONNECTED TO ${serverName} [${host}]`);
      console.log(`========================================`);

      const cmd = `
        echo "=== 1. SEARCHING FOR SW69L6795GO OR IMAGE TIMESTAMPS IN ALL FILES ==="
        grep -rnw '/home' -e '1783955141' -e 'sw69l6795go' 2>/dev/null | grep -v 'node_modules' | grep -v 'dist/assets' | head -n 50

        echo "=== 2. SEARCHING FOR BIOGRAPHY OR EDUCATION OR EXPERIENCE IN ALL BACKUP/JSON FILES ==="
        find /home /tmp /var /root -name "*.json*" -o -name "*.bak" -o -name "*.old" -o -name "*.sql" 2>/dev/null | grep -v 'node_modules' | while read file; do
          if grep -q "education" "$file" 2>/dev/null && grep -q "sw69l6795go" "$file" 2>/dev/null; then
             echo "MATCH FOUND IN: $file"
          fi
        done

        echo "=== 3. SEARCHING GIT LOG FOR DELETED/MODIFIED BIOGRAPHY DATA ==="
        cd /home/*/*/ 2>/dev/null || true
        git log -S "sw69l6795go" -p 2>/dev/null | head -n 100 || true
        git log -S "biography" -p 2>/dev/null | head -n 100 || true
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
  await checkServer('160.187.147.125', 'MatKhauDay123@', 'CHORUS VPS 160');
  await checkServer('36.50.177.253', 'MatKhauDay123', 'BBB VPS 36');
}

run();
