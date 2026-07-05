const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');
const search = 'fetch(\'/api/acp/artists/create\'';
let idx = code.indexOf(search);
console.log(code.substring(idx - 500, idx + 500));
