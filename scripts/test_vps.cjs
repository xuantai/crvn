const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  const cmd = `
    echo "=== VERIFY ACXUANTAI API DATA ==="
    curl -s -H "Host: acxuantai.bbb.bz" http://127.0.0.1:3333/api/data | head -c 400
  `;

  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('stderr', d => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
