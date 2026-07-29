const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    echo "=== 1. LISTING DIRECTORIES ON CHORUS VPS ==="
    ls -la /home/ /var/www/ 2>/dev/null
    
    echo "=== 2. FINDING ALL JSON AND DB FILES ON CHORUS VPS ==="
    find /home/ /var/www/ -type f \\( -name "*.json" -o -name "*.db" -o -name "*.sqlite*" -o -name "*.txt" \\) 2>/dev/null
    
    echo "=== 3. EXAMINING acxuantai DATA FILES ==="
    node -e "
      const fs = require('fs');
      const path = require('path');
      
      const searchPaths = [
        '/home/tai/htdocs/tai/data_acxuantai.json',
        '/home/tai/htdocs/tai/data.json',
        '/home/tai/htdocs/tai/artists.json',
        '/home/acxuantai/htdocs/acxuantai.com/records/admin_config.json',
        '/var/www/html/data_acxuantai.json'
      ];
      
      searchPaths.forEach(p => {
        if (fs.existsSync(p)) {
          console.log('=== FILE FOUND AT:', p, '===');
          try {
            const content = fs.readFileSync(p, 'utf-8');
            const data = JSON.parse(content);
            const item = Array.isArray(data) ? data.find(x => x.username === 'acxuantai') : data;
            if (item) {
              console.log('aboutMe:', JSON.stringify(item.aboutMe, null, 2));
              console.log('biography:', JSON.stringify(item.biography, null, 2));
            }
          } catch(e) {
            console.log('Error reading:', e.message);
          }
        }
      });
    " 2>/dev/null

    echo "=== 4. CHECKING SQLITE DATABASES IF ANY ==="
    sqlite3 /home/tai/htdocs/tai/bbb_global.db "SELECT username, data_json FROM artists WHERE username='acxuantai';" 2>/dev/null
    sqlite3 /home/tai/htdocs/tai/chorus.db "SELECT * FROM artists WHERE username='acxuantai';" 2>/dev/null
  `;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      fs.writeFileSync('chorus_vps_scan_result.txt', out);
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
