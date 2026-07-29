const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const start = code.indexOf('<form onSubmit={handleProfileSave}');
const end = code.indexOf('<hr className="border-stone-200" />', start);
console.log(code.substring(start, end));
