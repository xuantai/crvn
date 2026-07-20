const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 3. Fix demo.isBrand singer text color in list item cards
code = code.replace(
  /\? 'text-neutral-400'/g,
  "? 'text-neutral-200'"
);

fs.writeFileSync('src/App.tsx', code);
