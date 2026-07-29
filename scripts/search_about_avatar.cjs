const fs = require('fs');
const content = fs.readFileSync('temp.js', 'utf8');
const idx = content.indexOf('Về Tôi');
const aboutViewStr = content.substring(idx - 2500, idx + 100);
console.log(aboutViewStr);
