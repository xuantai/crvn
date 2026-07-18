const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetComposerColor = `className={\`text-xs md:text-sm text-center mb-1 md:mb-6 relative z-30 \${templateType === '6' ? 'font-semibold text-pink-700' : 'font-medium opacity-60'}\`}`;
const replaceComposerColor = `className={\`text-xs md:text-sm text-center mb-1 md:mb-6 relative z-30 \${templateType === '6' ? 'font-semibold text-pink-700' : templateType === '19' ? 'font-semibold text-[#D95B16]' : templateType === '20' ? 'font-semibold text-[#3B82F6]' : 'font-medium opacity-60'}\`}`;
code = code.replace(targetComposerColor, replaceComposerColor);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated composer text colors");
