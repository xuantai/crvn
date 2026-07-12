const fs = require('fs');
const content = fs.readFileSync('bundle.js', 'utf8');
const regex = /.{0,300}Ca nhạc sĩ.{0,500}/;
const match = content.match(regex);
console.log(match ? match[0] : 'not found');
