const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn
    echo "=== GIT COMMITS ON CHORUS VPS ==="
    git log --oneline -n 20 2>/dev/null
    
    echo "=== CHECKING PREVIOUS REVISIONS OF data_acxuantai.json IN GIT ==="
    git log -S "Phan Bội Châu" -p 2>/dev/null | head -n 40
    git log -S "biography" -p 2>/dev/null | head -n 40
    git log -S "aboutMe" -p 2>/dev/null | head -n 40
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
