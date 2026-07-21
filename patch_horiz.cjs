const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="flex flex-col justify-center w-full"',
  'className="absolute inset-0 flex flex-col justify-center w-full"'
);
content = content.replace(
  'className="flex flex-col justify-center w-full"',
  'className="absolute inset-0 flex flex-col justify-center w-full"'
);

fs.writeFileSync('src/App.tsx', content);
