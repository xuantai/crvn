const { Client } = require('ssh2');

async function checkTimestampOnVps(ip, pwd, name) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`=== CHECKING TIMESTAMPS ON ${name} [${ip}] ===`);

      const cmd = `
        node -e "
          const fs = require('fs');
          const p = '${name === 'CHORUS' ? '/home/chorus/htdocs/chorus.vn/data_acxuantai.json' : '/home/bbb/htdocs/bbb.bz/data_acxuantai.json'}';
          if (fs.existsSync(p)) {
            const stat = fs.statSync(p);
            console.log('File path:', p);
            console.log('Last Modified Time (mtime):', stat.mtime.toISOString(), '(', stat.mtime.toString(), ')');
            console.log('Last Change Time (ctime):', stat.ctime.toISOString(), '(', stat.ctime.toString(), ')');
          } else {
            console.log('File not found:', p);
          }
        "
        echo "=== NGINX / PM2 SYNC ACCESS LOGS ON ${name} ==="
        grep -i "sync" /var/log/nginx/access.log 2>/dev/null | tail -n 20 || true
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
      host: ip,
      port: 22,
      username: 'root',
      password: pwd,
      readyTimeout: 30000
    });
  });
}

async function main() {
  await checkTimestampOnVps('160.187.147.125', 'MatKhauDay123@', 'CHORUS');
  await checkTimestampOnVps('36.50.177.253', 'MatKhauDay123', 'BBB.BZ');
}

main().catch(console.error);
