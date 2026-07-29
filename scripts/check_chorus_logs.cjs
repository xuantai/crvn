const { Client } = require('ssh2');

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        resolve({ code, out, errOut });
      }).on('data', d => { out += d.toString(); }).stderr.on('data', d => { errOut += d.toString(); });
    });
  });

  console.log("=== Last 50 lines of PM2 logs for chorusvn ===");
  const pm2Log = await execCmd('pm2 logs chorusvn --lines 50 --nostream');
  console.log(pm2Log.out, pm2Log.errOut);

  conn.end();
}

main().catch(console.error);
