const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const files = [
        '/home/chorus/htdocs/chorus.vn/data_acxuantai.json',
        '/home/chorus/htdocs/chorus.vn/data.json',
        '/home/chorus/htdocs/chorus.vn/artists.json',
        '/home/chorus/htdocs/chorus.vn/bbb_global.db'
      ];

      files.forEach(p => {
        if (fs.existsSync(p)) {
          console.log('=== FOUND FILE ON CHORUS VPS:', p, '===');
          try {
            const content = fs.readFileSync(p, 'utf-8');
            if (p.endsWith('.json')) {
              const data = JSON.parse(content);
              const item = Array.isArray(data) ? data.find(x => x.username === 'acxuantai') : data;
              if (item) {
                console.log('aboutMe:', JSON.stringify(item.aboutMe, null, 2));
                console.log('biography:', JSON.stringify(item.biography, null, 2));
              }
            } else {
              console.log('File size:', content.length, 'bytes');
            }
          } catch(e) {
            console.log('Error reading:', e.message);
          }
        } else {
          console.log('File not found:', p);
        }
      });
    "
    echo "=== CHECKING ALL JSON FILES IN /home/chorus/htdocs/chorus.vn ==="
    ls -la /home/chorus/htdocs/chorus.vn/*.json 2>/dev/null
    
    echo "=== CHECKING SQLITE DATABASE ON CHORUS VPS IF EXISTS ==="
    sqlite3 /home/chorus/htdocs/chorus.vn/bbb_global.db "SELECT username, data_json FROM artists WHERE username='acxuantai';" 2>/dev/null
    sqlite3 /home/chorus/htdocs/chorus.vn/chorus.db "SELECT * FROM artists WHERE username='acxuantai';" 2>/dev/null
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
