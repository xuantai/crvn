const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetContainerStyle = `                   templateType === '18' ? 'shadow-[0_0_60px_rgba(251,191,36,0.3)] border-2 border-amber-500/50 rounded-full transition-transform duration-500' : 'shadow-2xl rounded-3xl border-4'`;
const replaceContainerStyle = `                   templateType === '18' ? 'shadow-[0_0_60px_rgba(251,191,36,0.3)] border-2 border-amber-500/50 rounded-full transition-transform duration-500' : 
                   templateType === '19' ? 'rounded-xl overflow-visible shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-transparent border-0' : 
                   templateType === '20' ? 'rounded-xl overflow-visible shadow-[0_20px_50px_rgba(255,105,180,0.4)] bg-transparent border-0' : 'shadow-2xl rounded-3xl border-4'`;

code = code.replace(targetContainerStyle, replaceContainerStyle);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated container style");
