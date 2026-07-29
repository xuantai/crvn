const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  const cmd = `
    grep -rn "clp" /etc/clp/ 2>/dev/null || cat /root/.clp-mariadb-password 2>/dev/null || cat /etc/clp-mariadb-password 2>/dev/null || find / -name "*mariadb*" 2>/dev/null | grep -v "/proc" | grep -v "/sys" | head -n 30
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
