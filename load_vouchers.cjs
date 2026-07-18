const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loadStr = `
    try {
      const vDoc = await getDoc(doc(db, 'app_data', 'vouchers'));
      if (vDoc.exists() && vDoc.data().vouchers) {
        vouchers = vDoc.data().vouchers;
        await fs.writeFile(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2), 'utf-8');
      }
    } catch (e) {}
`;

code = code.replace(
  "const masterDoc = doc(db, 'app_data', 'master');",
  "const masterDoc = doc(db, 'app_data', 'master');\n" + loadStr
);

fs.writeFileSync('server.ts', code);
