const fs = require('fs');
const content = fs.readFileSync('bundle.js', 'utf8');
const regex = /.{0,150}from-amber-400.{0,150}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[0]);
}
