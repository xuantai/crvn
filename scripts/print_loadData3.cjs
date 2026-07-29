const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const search = 'async function loadData';
let idx = code.indexOf(search);
console.log(code.substring(idx + 3000, idx + 4500));
