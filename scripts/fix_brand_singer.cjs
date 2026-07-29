const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /\? 'text-neutral-200'/g,
  "? 'text-neutral-200 font-medium'"
);

fs.writeFileSync('src/App.tsx', code);
