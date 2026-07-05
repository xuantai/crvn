const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const search = 'fetch(\'/api/admin/login\'';
let idx = code.indexOf(search);
console.log(code.substring(idx - 500, idx + 500));
