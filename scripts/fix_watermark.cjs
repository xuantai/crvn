const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `className="absolute inset-0 w-full h-full object-cover opacity-[0.15] blur-2xl scale-150 transition-transform duration-1000 ease-out group-hover:scale-[1.75]"`;
const replace1 = `className="absolute inset-0 w-full h-full object-cover rounded-full opacity-[0.15] blur-2xl scale-150 transition-transform duration-1000 ease-out group-hover:scale-[1.75]"`;

const target2 = `className="absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.25] blur-[1px] rotate-12 scale-100 transition-all duration-1000 ease-out group-hover:scale-110 group-hover:opacity-[0.4] group-hover:rotate-6"`;
const replace2 = `className="absolute -right-4 -bottom-4 w-28 h-28 object-cover rounded-full opacity-[0.25] blur-[1px] rotate-12 scale-100 transition-all duration-1000 ease-out group-hover:scale-110 group-hover:opacity-[0.4] group-hover:rotate-6"`;

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated watermarks masking");
