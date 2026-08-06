const { Client } = require('ssh2');

const SSH_CONFIG = {
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
};

async function check() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });

  const execCmd = (cmd) => new Promise((resolve) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return resolve(err.message);
      let out = '', errOut = '';
      stream.on('close', () => resolve(out + '\n' + errOut))
        .on('data', d => { out += d; })
        .stderr.on('data', d => { errOut += d; });
    });
  });

  console.log('--- Content of /home/chorus/htdocs/chorus.vn/dist/index.html ---');
  console.log(await execCmd('cat /home/chorus/htdocs/chorus.vn/dist/index.html'));

  console.log('--- Check if woodBgAsset is inside index-CmJG4T2a.js ---');
  console.log(await execCmd('grep -o "wood-bg.jpg" /home/chorus/htdocs/chorus.vn/dist/assets/*.js'));

  console.log('--- Check if PlaylistSelect height class is in index-CmJG4T2a.js ---');
  console.log(await execCmd('grep -o "h-\\[60px\\]" /home/chorus/htdocs/chorus.vn/dist/assets/*.js'));

  conn.end();
}

check();
