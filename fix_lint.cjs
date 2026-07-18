const fs = require('fs');

// Fix ACPControlPanel.tsx
let acpCode = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');
acpCode = acpCode.replace(
  /document\.getElementById\('new-voucher-code'\)\.value/g,
  `(document.getElementById('new-voucher-code') as HTMLInputElement).value`
);
acpCode = acpCode.replace(
  /document\.getElementById\('new-voucher-songs'\)\.value/g,
  `(document.getElementById('new-voucher-songs') as HTMLInputElement).value`
);
acpCode = acpCode.replace(
  /document\.getElementById\('new-voucher-templates'\)\.value/g,
  `(document.getElementById('new-voucher-templates') as HTMLInputElement).value`
);
acpCode = acpCode.replace(
  /document\.getElementById\('new-voucher-vip'\)\.value/g,
  `(document.getElementById('new-voucher-vip') as HTMLInputElement).value`
);
fs.writeFileSync('src/components/ACPControlPanel.tsx', acpCode);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /boxShadow: isColorLight \? '0 4px 12px rgba\(0,0,0,0\.3\)' : '0 4px 12px rgba\(0,0,0,0\.1\)'/g,
  `boxShadow: isColorLight ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',\n    dotColor: primaryColor`
);
fs.writeFileSync('src/App.tsx', appCode);

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  /const roleDef = \(landingConf\.roles \|\| \[\]\)/g,
  `const roleDef = ((landingConf as any).roles || [])`
);
fs.writeFileSync('server.ts', serverCode);

console.log("Lint errors fixed");
