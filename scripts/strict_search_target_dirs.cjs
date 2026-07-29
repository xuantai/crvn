const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

console.log('=== STRICT SEARCH: ONLY IN /home/tai/htdocs/tai & FIREBASE ===\n');

// 1. Check local /home/tai/htdocs/tai files in project folder
const targetFiles = [
  'data_acxuantai.json',
  'artists.json',
  'data.json'
];

console.log('--- [1. Checking local project data files in /home/tai/htdocs/tai equivalent] ---');
for (const f of targetFiles) {
  if (fs.existsSync(f)) {
    try {
      const content = fs.readFileSync(f, 'utf-8');
      const json = JSON.parse(content);
      let record = null;
      if (Array.isArray(json)) {
        record = json.find(x => x.username === 'acxuantai');
      } else {
        record = json;
      }
      if (record) {
        console.log(`📌 File: ${f}`);
        console.log('   aboutMe:', record.aboutMe ? JSON.stringify(record.aboutMe, null, 2) : 'EMPTY / UNDEFINED');
        console.log('   biography:', record.biography ? JSON.stringify(record.biography, null, 2) : 'EMPTY / UNDEFINED');
      }
    } catch (e) {
      console.log(`Error parsing ${f}:`, e.message);
    }
  }
}

// 2. Check VPS /home/tai/htdocs/tai specifically via SSH
async function checkVpsTarget() {
  console.log('\n--- [2. Checking VPS directory strictly at /home/tai/htdocs/tai] ---');
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      const cmd = `
        node -e "
          const fs = require('fs');
          const p = '/home/tai/htdocs/tai/data_acxuantai.json';
          if (fs.existsSync(p)) {
            console.log('=== /home/tai/htdocs/tai/data_acxuantai.json ===');
            const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
            console.log('aboutMe:', JSON.stringify(d.aboutMe, null, 2));
            console.log('biography:', JSON.stringify(d.biography, null, 2));
          } else {
            console.log('data_acxuantai.json not found in /home/tai/htdocs/tai');
          }
        "
        echo "=== VPS SQLite /home/tai/htdocs/tai/bbb_global.db ==="
        sqlite3 /home/tai/htdocs/tai/bbb_global.db "SELECT username, data_json FROM artists WHERE username='acxuantai';" 2>/dev/null
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
      host: '36.50.177.253',
      port: 22,
      username: 'root',
      password: 'MatKhauDay123',
      readyTimeout: 30000
    });
  });
}

checkVpsTarget().catch(console.error);
