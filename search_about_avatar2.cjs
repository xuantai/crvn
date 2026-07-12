const fs = require('fs');
const content = fs.readFileSync('temp.js', 'utf8');
const idx = content.indexOf('from-[#eab308]');
const aboutViewStr = content.substring(idx - 500, idx + 1000);
console.log(aboutViewStr);
