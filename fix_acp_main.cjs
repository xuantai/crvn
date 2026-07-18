const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  '<div className="flex h-screen bg-black text-white font-sans overflow-hidden">',
  '<main className="flex h-screen bg-black text-white font-sans overflow-hidden">'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
