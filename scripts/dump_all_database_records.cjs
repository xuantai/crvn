const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

async function checkLocalFiles() {
  console.log('=== 1. LOCAL DATA FILES ===');
  const files = ['data_acxuantai.json', 'artists.json', 'data.json'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const content = fs.readFileSync(f, 'utf-8');
        console.log(`--- [File: ${f}] ---`);
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          const item = json.find(x => x.username === 'acxuantai');
          if (item) {
            console.log(`Found acxuantai record in ${f}:`, JSON.stringify({
              aboutMe: item.aboutMe,
              biography: item.biography,
              artistBio: item.artistBio
            }, null, 2));
          }
        } else {
          console.log(`acxuantai data in ${f}:`, JSON.stringify({
            aboutMe: json.aboutMe,
            biography: json.biography,
            artistBio: json.artistBio
          }, null, 2));
        }
      } catch (e) {
        console.log(`Error parsing ${f}:`, e.message);
      }
    }
  }
}

async function checkVpsDatabase() {
  console.log('\n=== 2. VPS DATABASE (bbb_global.db & data_acxuantai.json on VPS) ===');
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      const cmd = `
        node -e "
          const fs = require('fs');
          ['data_acxuantai.json', 'data.json', 'artists.json'].forEach(f => {
            const p = '/home/tai/htdocs/tai/' + f;
            if (fs.existsSync(p)) {
              console.log('=== VPS FILE:', f, '===');
              const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
              if (Array.isArray(d)) {
                const item = d.find(x => x.username === 'acxuantai');
                console.log(JSON.stringify(item ? { aboutMe: item.aboutMe, biography: item.biography } : 'not found', null, 2));
              } else {
                console.log(JSON.stringify({ aboutMe: d.aboutMe, biography: d.biography }, null, 2));
              }
            }
          });
        "
        echo "=== VPS SQLITE TABLE artists ==="
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

async function main() {
  await checkLocalFiles();
  await checkVpsDatabase();
}

main().catch(console.error);
