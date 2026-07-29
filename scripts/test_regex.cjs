const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const matches = code.match(/<motion\.img[^>]*src=\{demo(?:\?)?\.brandLogoUrl\}[^>]*>[\s\S]*?<\/motion\.img>/g);
console.log(matches ? matches.length : 0);
