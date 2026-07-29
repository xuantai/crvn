const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `className="fixed bottom-6 right-6 z-[99] flex items-center gap-3 bg-stone-950/85 text-white px-4 py-2.5 rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"`;

const replacement1 = `className="fixed bottom-6 right-6 z-[99] flex items-center gap-3 bg-stone-950/30 text-white px-4 py-2.5 rounded-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-[24px]"`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/App.tsx', code);
