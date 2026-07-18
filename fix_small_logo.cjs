const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSmallLogo = `<img src={demo.brandLogoUrl} className="w-5 h-5 object-contain" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }} alt={demo.brandName} referrerPolicy="no-referrer" />`;
const replaceSmallLogo = `<img src={demo.brandLogoUrl} className="w-5 h-5 object-cover rounded-full ring-1 ring-black/5" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }} alt={demo.brandName} referrerPolicy="no-referrer" />`;

code = code.replaceAll(targetSmallLogo, replaceSmallLogo);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated small logo masking");
