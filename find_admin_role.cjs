const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('roleId') && l.includes('text-[10px]'));
if (idx !== -1) {
    console.log(lines.slice(idx - 5, idx + 15).join('\n'));
}
