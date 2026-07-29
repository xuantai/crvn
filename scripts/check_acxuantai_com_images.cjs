const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  const cmd = `
    echo "=== IMAGES IN /home/acxuantai/htdocs/acxuantai.com/ ==="
    find /home/acxuantai/htdocs/acxuantai.com/ -type f \\( -name "*.jpg" -o -name "*.png" -o -name "*.webp" -o -name "*.jpeg" \\) 2>/dev/null
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
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
