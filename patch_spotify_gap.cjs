const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 \${isFirst ? 'pt-36 sm:pt-40 md:pt-48 pb-10' : 'pb-6'}\`}`;
const replacement = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 \${isFirst ? 'pt-32 sm:pt-36 pb-10' : 'pb-6'}\`}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced spotify padding");
}
