const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const SSH_CONFIG = {
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
};

const REMOTE_DIR = '/home/bbb/htdocs/bbb.bz';

async function main() {
  console.log('=== Step 1: Connecting to VPS via SSH ===');
  const conn = new Client();
  
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('SSH connection established successfully.');

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(out);
        else reject(new Error(`Command "${cmd}" exited with code ${code}.\nSTDERR: ${errOut}\nSTDOUT: ${out}`));
      }).on('data', d => { out += d.toString(); }).stderr.on('data', d => { errOut += d.toString(); });
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const uploadFile = (localPath, remotePath) => new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) return reject(err);
      console.log(`Uploaded: ${path.basename(localPath)} -> ${remotePath}`);
      resolve();
    });
  });

  const ensureDir = (remotePath) => new Promise((resolve) => {
    sftp.mkdir(remotePath, () => resolve());
  });

  async function uploadDirRecursive(localFolder, remoteFolder) {
    await ensureDir(remoteFolder);
    const items = fs.readdirSync(localFolder);
    for (const item of items) {
      const localItem = path.join(localFolder, item);
      const remoteItem = `${remoteFolder}/${item}`;
      const stat = fs.statSync(localItem);
      if (stat.isDirectory()) {
        await uploadDirRecursive(localItem, remoteItem);
      } else if (stat.isFile()) {
        await uploadFile(localItem, remoteItem);
      }
    }
  }

  console.log('\n=== Step 2: Syncing build artifacts and configuration files ===');
  
  // Ensure dist & public directories exist on remote
  await ensureDir(`${REMOTE_DIR}/dist`);
  await ensureDir(`${REMOTE_DIR}/dist/assets`);
  await ensureDir(`${REMOTE_DIR}/public`);

  // Upload dist files
  const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
  for (const file of distFiles) {
    const fullPath = path.join(__dirname, 'dist', file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      await uploadFile(fullPath, `${REMOTE_DIR}/dist/${file}`);
    }
  }

  const assetsDir = path.join(__dirname, 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    for (const file of assetFiles) {
      await uploadFile(path.join(assetsDir, file), `${REMOTE_DIR}/dist/assets/${file}`);
    }
  }

  // Upload root data JSON and configs
  const rootFiles = fs.readdirSync(__dirname);
  for (const file of rootFiles) {
    if (file.endsWith('.json') || file.endsWith('.db') || file === 'server.ts' || file === 'package.json' || file === '.env') {
      const fullPath = path.join(__dirname, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        await uploadFile(fullPath, `${REMOTE_DIR}/${file}`);
      }
    }
  }

  console.log('\n=== Step 2b: Syncing local uploads/ folder (MP3s & Images) ===');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    await uploadDirRecursive(uploadsDir, `${REMOTE_DIR}/uploads`);
    await uploadDirRecursive(uploadsDir, `${REMOTE_DIR}/public/uploads`);
  }

  console.log('\n=== Step 3: Setting up Nginx for bbb.bz & *.bbb.bz ===');
  const nginxConf = `server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  ssl_certificate /etc/nginx/ssl-certificates/bbb.bz.crt;
  ssl_certificate_key /etc/nginx/ssl-certificates/bbb.bz.key;
  server_name www.bbb.bz;
  return 301 https://bbb.bz$request_uri;
}

server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  ssl_certificate /etc/nginx/ssl-certificates/bbb.bz.crt;
  ssl_certificate_key /etc/nginx/ssl-certificates/bbb.bz.key;
  server_name bbb.bz *.bbb.bz;
  root ${REMOTE_DIR};

  access_log /home/tai/logs/nginx/access.log main;
  error_log /home/tai/logs/nginx/error.log;

  location ~ /.well-known {
    auth_basic off;
    allow all;
  }

  include /etc/nginx/global_settings;

  index index.html;

  location /uploads/ {
    alias ${REMOTE_DIR}/uploads/;
    add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
    add_header Access-Control-Allow-Origin "*";
    types {
      audio/mpeg mp3;
      audio/ogg ogg;
      audio/wav wav;
      image/jpeg jpg jpeg;
      image/png png;
      image/webp webp;
    }
  }

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout 900;
    proxy_send_timeout 900;
    proxy_read_timeout 900;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
  }
}
`;

  const writeNginxCmd = `cat << 'EOF' > /etc/nginx/sites-enabled/bbb.bz.conf\n${nginxConf}\nEOF`;
  await execCmd(writeNginxCmd);
  console.log('Nginx config created for bbb.bz and *.bbb.bz');

  console.log('\n=== Step 4: Testing & Reloading Nginx ===');
  const nginxTest = await execCmd('nginx -t && systemctl reload nginx');
  console.log('Nginx reload output:', nginxTest);

  console.log('\n=== Step 5: Restarting PM2 process (demonhac) ===');
  const pm2Result = await execCmd('pm2 restart demonhac');
  console.log('PM2 output:\n', pm2Result);

  conn.end();
  console.log('\n✅ Deployment to VPS (36.50.177.253) finished successfully!');
}

main().catch(err => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
