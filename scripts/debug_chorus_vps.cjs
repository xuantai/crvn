const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('=== SETTING PORT=3000 IN .ENV AND RESTARTING PM2 ===');
  const cmd = `
    cd /home/chorus/htdocs/chorus.vn
    
    # Append or set PORT=3000 in .env
    grep -q "PORT=" .env && sed -i 's/PORT=.*/PORT=3000/' .env || echo "PORT=3000" >> .env

    NODE_ENV=production PORT=3000 /root/.nvm/versions/node/v20.20.2/bin/pm2 restart chorusvn --update-env

    sleep 2
    echo '=== TESTING PORT 3000 ==='
    curl -I http://127.0.0.1:3000
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
  readyTimeout: 15000
});
