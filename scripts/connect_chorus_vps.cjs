const { Client } = require('ssh2');

const passwords = ['MatKhauDay123', 'root', '123456'];

async function tryPassword(pwd) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`✅ SSH SUCCESS to chorus.vn VPS [160.187.147.125] with password: ${pwd}`);
      
      const cmd = `
        echo "=== SEARCHING DATA FILES ON CHORUS VPS (160.187.147.125) ==="
        find /home/ /var/www/ -name "*acxuantai*.json" -o -name "*data*.json" -o -name "*bbb*.db" 2>/dev/null
        
        node -e "
          const fs = require('fs');
          const paths = [
            '/home/tai/htdocs/tai/data_acxuantai.json',
            '/home/tai/htdocs/tai/data.json',
            '/var/www/html/data_acxuantai.json',
            '/home/chorus/htdocs/data_acxuantai.json'
          ];
          paths.forEach(p => {
            if (fs.existsSync(p)) {
              console.log('=== FOUND FILE:', p, '===');
              const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
              console.log('aboutMe:', JSON.stringify(d.aboutMe, null, 2));
              console.log('biography:', JSON.stringify(d.biography, null, 2));
            }
          });
        " 2>/dev/null
      `;

      conn.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.on('stderr', d => out += d.toString());
        stream.on('close', () => {
          console.log(out);
          conn.end();
          resolve(true);
        });
      });
    }).on('error', (err) => {
      console.log(`Failed password [${pwd}]:`, err.message);
      resolve(false);
    }).connect({
      host: '160.187.147.125',
      port: 22,
      username: 'root',
      password: pwd,
      readyTimeout: 10000
    });
  });
}

async function main() {
  for (const pwd of passwords) {
    const success = await tryPassword(pwd);
    if (success) break;
  }
}

main().catch(console.error);
