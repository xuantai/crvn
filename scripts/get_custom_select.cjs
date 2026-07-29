const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('function CustomSelect'));
if (idx !== -1) {
    console.log(lines.slice(idx + 35, idx + 80).join('\n'));
}
