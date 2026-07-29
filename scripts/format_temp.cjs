const fs = require('fs');
const content = fs.readFileSync('temp.js', 'utf8');
const idx = content.indexOf('Về Tôi');
console.log(content.substring(idx - 1000, idx + 1500));
