const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('roleId ==='));
if (idx !== -1) {
    console.log(lines.slice(idx - 10, idx + 10).join('\n'));
}
