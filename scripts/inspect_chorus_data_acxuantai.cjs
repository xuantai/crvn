const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const p = '/home/chorus/htdocs/chorus.vn/data_acxuantai.json';
      if (fs.existsSync(p)) {
        const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
        console.log('=== KEYS IN /home/chorus/htdocs/chorus.vn/data_acxuantai.json ===');
        console.log(Object.keys(d));
        console.log('aboutMe:', d.aboutMe);
        console.log('biography:', d.biography);
        console.log('artistBio:', d.artistBio);
        console.log('pageTitle:', d.pageTitle);
      }
    "
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
