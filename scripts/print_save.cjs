const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const search = 'const handleProfileSave';
let idx = code.indexOf(search);
console.log(code.substring(idx, idx + 800));
