const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const script = `
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
            path: fullPath,
            relPath: path.relative(rootDir, fullPath),
            size: stat.size,
            mtime: stat.mtime
          });
        }
      }
    }
  } catch (e) {}
}

walkDir(rootDir);

console.log('=== SUMMARY OF IMAGES ON SERVER 160 (chorus.vn) ===');
console.log('Total image files:', results.length);
const totalBytes = results.reduce((acc, item) => acc + item.size, 0);
console.log('Total image size:', (totalBytes / (1024 * 1024)).toFixed(2) + ' MB');

const dirMap = {};
results.forEach(img => {
  const dir = path.dirname(img.relPath);
  if (!dirMap[dir]) dirMap[dir] = [];
  dirMap[dir].push(img);
});

console.log('\\n=== BREAKDOWN BY DIRECTORY ===');
for (const [dir, list] of Object.entries(dirMap)) {
  const sizeMB = (list.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(2);
  console.log(\`\\nFolder: [\${dir}] (\${list.length} files, \${sizeMB} MB)\`);
  list.forEach(item => {
    const szKB = (item.size / 1024).toFixed(1) + ' KB';
    console.log(\`  - \${path.basename(item.relPath)} (\${szKB}) [Modified: \${item.mtime.toISOString().split('T')[0]}]\`);
  });
}
`;

  const cmd = `
    cat << 'EOF' > /tmp/scan_images.js
${script}
EOF
    node /tmp/scan_images.js
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
