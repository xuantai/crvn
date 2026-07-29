const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The main !isVault wrapper
const target1 = `className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 pt-32 sm:pt-36"`;
const replacement1 = `className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 pt-24 sm:pt-28"`;
if (code.includes(target1)) code = code.replace(target1, replacement1);

// The vault wrapper
const target2 = `className={\`scroll-mt-24 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-10 \${firstSection === 'vault' ? 'pt-32 sm:pt-36' : ''}\`}`;
const replacement2 = `className={\`scroll-mt-24 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-10 \${firstSection === 'vault' ? 'pt-24 sm:pt-28' : ''}\`}`;
if (code.includes(target2)) code = code.replace(target2, replacement2);

// The spotify wrapper
const target3 = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 \${isFirst ? 'pt-32 sm:pt-36 pb-10' : 'pb-6'}\`}`;
const replacement3 = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 \${isFirst ? 'pt-24 sm:pt-28 pb-10' : 'pb-6'}\`}`;
if (code.includes(target3)) code = code.replace(target3, replacement3);

// The mv wrapper
const target4 = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 \${firstSection === 'mv' ? 'pt-32 sm:pt-36' : ''}\`}`;
const replacement4 = `className={\`w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 \${firstSection === 'mv' ? 'pt-24 sm:pt-28' : ''}\`}`;
if (code.includes(target4)) code = code.replace(target4, replacement4);

// The title wrapper
const target5 = `className={\`relative \${isFirst ? 'pt-32 sm:pt-36' : 'pt-12 sm:pt-16'} pb-10 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[300px]\`}`;
const replacement5 = `className={\`relative \${isFirst ? 'pt-24 sm:pt-28' : 'pt-12 sm:pt-16'} pb-10 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[300px]\`}`;
if (code.includes(target5)) code = code.replace(target5, replacement5);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated padding for layout");
