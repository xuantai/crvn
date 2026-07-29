const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `className={\`scroll-mt-24 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-10 \${firstSection === 'vault' ? 'pt-36 sm:pt-40 md:pt-48' : ''}\`}`;
const replacement = `className={\`scroll-mt-24 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-10 \${firstSection === 'vault' ? 'pt-32 sm:pt-36' : ''}\`}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced vault padding");
}

