const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  const cmd = `
    node -e '
      const fs = require("fs");
      const path = require("path");
      const keywords = ["Phan Bội Châu", "Suzuki", "Bunkyo", "Hoàng Tử Quỷ", "Vinhomes", "Running"];

      function searchFile(fp) {
        try {
          const content = fs.readFileSync(fp, "utf-8");
          for (const kw of keywords) {
            if (content.includes(kw)) {
              console.log("🔥 MATCH FOUND in file:", fp, "for keyword:", kw);
              console.log("Snippet:", content.substring(Math.max(0, content.indexOf(kw) - 100), content.indexOf(kw) + 300));
            }
          }
        } catch(e) {}
      }

      function walk(dir) {
        try {
          const list = fs.readdirSync(dir);
          for (const f of list) {
            if (f === "node_modules" || f === ".git" || f === ".nvm") continue;
            const full = path.join(dir, f);
            const st = fs.statSync(full);
            if (st.isDirectory()) {
              walk(full);
            } else if (f.endsWith(".json") || f.endsWith(".txt") || f.endsWith(".db") || f.endsWith(".sqlite") || f.endsWith(".sql")) {
              searchFile(full);
            }
          }
        } catch(e) {}
      }

      console.log("=== TARGETED FILE SEARCH ON VPS ===");
      ["/home/tai", "/home/acxuantai", "/home/ikey", "/home/ntl", "/var/www"].forEach(d => walk(d));
    '
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
