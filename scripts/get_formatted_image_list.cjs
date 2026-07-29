const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    node -e "
      const fs = require('fs');
      const path = require('path');

      const rootDir = '/home/chorus/htdocs/chorus.vn';
      const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.bmp', '.avif']);

      const results = [];

      function walkDir(dir) {
        if (dir.includes('node_modules') || dir.includes('.git')) return;
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const f of files) {
            const fullPath = path.join(dir, f.name);
            if (f.isDirectory()) {
              walkDir(fullPath);
            } else if (f.isFile()) {
              const ext = path.extname(f.name).toLowerCase();
              if (imageExtensions.has(ext)) {
                const stat = fs.statSync(fullPath);
                results.push({
                  relPath: path.relative(rootDir, fullPath).replace(/\\\\\\\\/g, '/'),
                  size: stat.size,
                  mtime: stat.mtime
                });
              }
            }
          }
        } catch (e) {}
      }

      walkDir(rootDir);

      console.log(JSON.stringify(results, null, 2));
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
