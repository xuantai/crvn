const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `const translateTemplateName = (nameOrId: string) => {`;
const replacement = `const translateTemplateName = (nameOrId: string, customNames?: Record<string, string>, id?: string) => {
  if (id && customNames?.[id]) return customNames[id];
  if (customNames && customNames[nameOrId]) return customNames[nameOrId];`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
