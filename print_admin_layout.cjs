const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const search = 'className="bg-stone-50 border-b border-stone-200"';
let idx = code.indexOf(search);
console.log(code.substring(Math.max(0, idx - 500), idx + 1000));
