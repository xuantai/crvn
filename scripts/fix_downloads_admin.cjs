const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target2 = `const rStr = typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '';`;
const replacement2 = `const rStr = typeof status !== 'undefined' ? (status === 'released' ? '' : ' (Demo)') : (typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '');`;

code = code.split(target2).join(replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed downloads admin!");
