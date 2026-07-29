const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Inspecting SQLite DBs...');

  const cmd = `
    echo "=== 1. TABLES IN bbb_global.db ON CHORUS VPS ==="
    sqlite3 /home/chorus/htdocs/chorus.vn/bbb_global.db ".tables" 2>/dev/null || true
    sqlite3 /home/chorus/htdocs/chorus.vn/bbb_global.db "SELECT username, data_json FROM artists WHERE username='acxuantai';" 2>/dev/null || true

    echo "=== 2. TABLES IN chorus.db ON CHORUS VPS ==="
    sqlite3 /home/chorus/htdocs/chorus.vn/chorus.db ".tables" 2>/dev/null || true
    sqlite3 /home/chorus/htdocs/chorus.vn/chorus.db "SELECT * FROM artists WHERE username='acxuantai';" 2>/dev/null || true
    sqlite3 /home/chorus/htdocs/chorus.vn/chorus.db "SELECT * FROM users WHERE username='acxuantai';" 2>/dev/null || true
    sqlite3 /home/chorus/htdocs/chorus.vn/chorus.db "SELECT * FROM profiles WHERE username='acxuantai';" 2>/dev/null || true

    echo "=== 3. SEARCHING FOR ANY STRING 'education' OR 'experience' INSIDE DATABASES ==="
    strings /home/chorus/htdocs/chorus.vn/bbb_global.db | grep -iE "education|experience|biography|aboutMe" | head -n 30 2>/dev/null || true
    strings /home/chorus/htdocs/chorus.vn/chorus.db | grep -iE "education|experience|biography|aboutMe" | head -n 30 2>/dev/null || true
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
