const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('Download File') || l.includes('{t("Tải Nhạc")}'));
if (idx !== -1) {
    console.log(lines.slice(idx - 20, idx + 10).join('\n'));
}
