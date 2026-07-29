const { Client } = require('ssh2');

async function cleanVPS(host, name, targetPath, passwords = ['MatKhauDay123']) {
  for (const pwd of passwords) {
    const success = await new Promise((resolve) => {
      const conn = new Client();
      conn.on('ready', () => {
        console.log(`\n========================================`);
        console.log(`✅ Connected to ${name} (${host}) using password: ${pwd}`);
        console.log(`========================================`);
        
        const cmd = `
          if [ -d "${targetPath}" ]; then
            cd "${targetPath}" &&
            mkdir -p scripts &&
            find . -maxdepth 1 -name '*.cjs' ! -name 'ecosystem.config.cjs' -exec mv {} scripts/ \\; 2>/dev/null &&
            find . -maxdepth 1 -name '*.py' -exec mv {} scripts/ \\; 2>/dev/null &&
            find . -maxdepth 1 -name '*.sh' -exec mv {} scripts/ \\; 2>/dev/null &&
            find . -maxdepth 1 -name 'lint*.txt' -exec mv {} scripts/ \\; 2>/dev/null &&
            find . -maxdepth 1 -name 'tmp*.txt' -exec mv {} scripts/ \\; 2>/dev/null &&
            echo "Dọn dẹp thư mục ${targetPath} thành công!" &&
            echo "Danh sách các item chính còn lại ở thư mục gốc:" &&
            ls -la
          else
            echo "Thư mục ${targetPath} không tồn tại trên ${host}"
          fi
        `;

        conn.exec(cmd, (err, stream) => {
          let out = '';
          stream.on('data', d => out += d.toString());
          stream.on('stderr', d => out += d.toString());
          stream.on('close', () => {
            console.log(out);
            conn.end();
            resolve(true);
          });
        });
      }).on('error', (err) => {
        resolve(false);
      }).connect({
        host: host,
        port: 22,
        username: 'root',
        password: pwd,
        readyTimeout: 10000
      });
    });
    if (success) return true;
  }
  console.error(`❌ Kết nối ${name} (${host}) thất bại với tất cả mật khẩu.`);
  return false;
}

async function main() {
  await cleanVPS('36.50.177.253', 'VPS 1 (bbb.bz)', '/home/bbb/htdocs/bbb.bz', ['MatKhauDay123']);
  await cleanVPS('160.187.147.125', 'VPS 2 (Chorus)', '/home/tai/htdocs/tai', ['MatKhauDay123', 'root', '123456']);
}

main().catch(console.error);
