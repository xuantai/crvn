const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Exhaustive Search Starting...');

  const cmd = `
    echo "=== 1. SEARCHING FOR EXACT BIO/ABOUT STRINGS ACROSS ALL FILES IN /home AND /var/www ==="
    grep -rnI "Phan Bội Châu" /home/ /var/www/ 2>/dev/null || true
    grep -rnI "Suzuki Shouten" /home/ /var/www/ 2>/dev/null || true
    grep -rnI "Hoàng Tử Quỷ" /home/ /var/www/ 2>/dev/null || true
    grep -rnI "Vinhomes Ca" /home/ /var/www/ 2>/dev/null || true

    echo "=== 2. SEARCHING FOR JSON KEYS 'aboutMe' OR 'biography' IN ALL JSON FILES ON VPS ==="
    node -e "
      const fs = require('fs');
      const execSync = require('child_process').execSync;
      try {
        const jsonFiles = execSync('find /home/ /var/www/ /root/ -name \"*.json\" 2>/dev/null').toString().trim().split('\n');
        console.log('Found ' + jsonFiles.length + ' JSON files on VPS.');
        jsonFiles.forEach(f => {
          if (!f || f.includes('node_modules') || f.includes('.npm')) return;
          try {
            const content = fs.readFileSync(f, 'utf-8');
            if (content.includes('biography') || content.includes('aboutMe') || content.includes('education') || content.includes('experience')) {
              console.log('📌 MATCHING FILE:', f);
              const data = JSON.parse(content);
              const item = Array.isArray(data) ? data.find(x => x && (x.username === 'acxuantai' || x.biography || x.aboutMe)) : data;
              if (item) {
                if (item.biography) console.log('   biography in ' + f + ':', JSON.stringify(item.biography, null, 2).slice(0, 300));
                if (item.aboutMe) console.log('   aboutMe in ' + f + ':', JSON.stringify(item.aboutMe, null, 2).slice(0, 300));
              }
            }
          } catch(e) {}
        });
      } catch(e) {
        console.log('Error:', e.message);
      }
    "

    echo "=== 3. SEARCHING SQLITE DATABASES ON CHORUS VPS ==="
    find /home/ /var/www/ -name "*.db" -o -name "*.sqlite*" 2>/dev/null
  `;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      fs.writeFileSync('chorus_vps_exhaustive_results.txt', out);
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
