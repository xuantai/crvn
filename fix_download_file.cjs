const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<Download className="w-4 h-4" /> Download File`;
const replacement = `<Download className="w-4 h-4" /> {t("Tải Nhạc")}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced Download File text");
} else {
    console.log("Target Download File not found");
}
