const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Tracing node startup...');

  const cmd = `
    cd /home/chorus/htdocs/chorus.vn
    echo "=== RUNNING NODE WITH TRACE LOGS ==="
    PORT=3000 NODE_ENV=production node -e "
      console.log('Step 1: requiring dist/server.cjs...');
      try {
        require('./dist/server.cjs');
        console.log('Step 2: required successfully');
      } catch (err) {
        console.error('CRASH ON REQUIRE:', err);
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
