const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const path = require('path');

      const data = JSON.parse(fs.readFileSync('/home/chorus/htdocs/chorus.vn/data_acxuantai.json', 'utf-8'));
      const songs = [...(data.demos || []), ...(data.releasedSongs || [])];
      
      console.log('=== SONGS WITH COVERS ===');
      songs.forEach(s => {
        if (s.coverUrl) {
          console.log(s.title + ' -> ' + s.coverUrl);
        }
      });

      console.log('\\n=== FILES IN PUBLIC UPLOADS ACXUANTAI ===');
      const files = fs.readdirSync('/home/chorus/htdocs/chorus.vn/public/uploads/acxuantai');
      files.forEach(f => {
        console.log('https://acxuantai.chorus.vn/uploads/acxuantai/' + f);
      });
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
