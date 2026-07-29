const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('/home/chorus/htdocs/chorus.vn/data_acxuantai.json', 'utf-8'));
      console.log('Keys:', Object.keys(data));
      console.log('biography:', JSON.stringify(data.biography, null, 2));
      console.log('aboutMe:', JSON.stringify(data.aboutMe, null, 2));
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
