const { Client } = require('ssh2');

const searchTerms = [
  "Phan Bội Châu",
  "Phan Boi Chau",
  "Suzuki Shouten",
  "Bunkyo",
  "Hoàng Tử Quỷ",
  "Hoang Tu Quy",
  "Vinhomes Ca",
  "Running Man",
  "Ca Khúc Chủ Đề"
];

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready - Searching VPS for exact text matches...');

  const grepCmds = searchTerms.map(term => 
    `grep -rnI "${term}" /home/ /var/www/ /tmp/ 2>/dev/null`
  ).join('\n');

  const sqliteCmds = searchTerms.map(term =>
    `sqlite3 /home/tai/htdocs/tai/bbb_global.db "SELECT * FROM artists WHERE data_json LIKE '%${term}%';" 2>/dev/null`
  ).join('\n');

  const cmd = `
    echo "=== 1. SEARCHING FILES ON VPS ==="
    ${grepCmds}

    echo "=== 2. SEARCHING SQLITE bbb_global.db ==="
    ${sqliteCmds}

    echo "=== 3. SEARCHING OTHER HOME DIRECTORIES ==="
    ls -la /home/ /home/acxuantai/ /home/tai/ /home/tai/backups/ /home/tai/htdocs/ 2>/dev/null
    find /home -type f \\( -name "*.json" -o -name "*.sqlite*" -o -name "*.db" -o -name "*.sql" \\) 2>/dev/null
  `;

  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('data', d => { output += d.toString(); });
    stream.on('stderr', d => { output += d.toString(); });
    stream.on('close', () => {
      console.log(output);
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
