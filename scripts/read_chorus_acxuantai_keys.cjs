const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('/home/chorus/htdocs/chorus.vn/data_acxuantai.json', 'utf-8'));
      console.log('Keys in data_acxuantai.json:', Object.keys(data));
      console.log('profile:', data.profile);
      console.log('aboutMe:', data.aboutMe);
      console.log('biography:', data.biography);
      console.log('artistBio:', data.artistBio);
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
