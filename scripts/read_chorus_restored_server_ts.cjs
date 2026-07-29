const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const content = fs.readFileSync('/home/chorus/htdocs/chorus.vn/server.ts', 'utf-8');
      const lines = content.split('\n');
      console.log('Total lines in server.ts:', lines.length);
      const startIdx = lines.findIndex(l => l.includes('async function startServer'));
      console.log('startServer at line:', startIdx + 1);
      if (startIdx !== -1) {
        console.log(lines.slice(startIdx, startIdx + 30).join('\n'));
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
