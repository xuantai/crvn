const fs = require('fs');
const content = fs.readFileSync('temp.js', 'utf8');
const idx = content.indexOf('Profile Card');
console.log(content.substring(idx - 1500, idx + 2000));
