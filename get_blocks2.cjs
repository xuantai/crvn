const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const faviconLabel = 'Favicon (Kéo thả)';
let faviconIdx = code.indexOf(faviconLabel);
console.log('Favicon idx:', faviconIdx);
if (faviconIdx !== -1) {
  console.log(code.substring(faviconIdx - 100, faviconIdx + 4000));
}
