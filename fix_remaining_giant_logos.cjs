const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<motion\.img[^>]*src=\{demo\.brandLogoUrl\}[^>]*>[\s\S]*?<\/motion\.img>/g;

let count = 0;
code = code.replace(regex, () => {
    count++;
    return '';
});
fs.writeFileSync('src/App.tsx', code);
console.log(`Removed ${count} remaining giant motion imgs.`);
