const fs = require('fs');
const content = fs.readFileSync('bundle.js', 'utf8');
const regex = /.{0,500}Kho Nhạc.{0,800}/;
const match = content.match(regex);
console.log(match ? match[0] : 'not found');
