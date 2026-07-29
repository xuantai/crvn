const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `const layoutOrder = data?.layoutSections || ['title', 'spotify', 'vault', 'mv'];`;
const replacement = `const layoutOrder = data?.layoutSections || landingConfig?.globalLayoutSections || ['title', 'spotify', 'vault', 'mv'];`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched layout order");
} else {
  console.log("Target not found");
}
