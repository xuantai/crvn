const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update isLight
const targetIsLight = `const isLight = templateType === '1' || templateType === '4' || templateType === '6' || templateType === '7' || templateType === '17';`;
const replaceIsLight = `const isLight = templateType === '1' || templateType === '4' || templateType === '6' || templateType === '7' || templateType === '17' || templateType === '20';`;
if(code.includes(targetIsLight)) {
    code = code.replace(targetIsLight, replaceIsLight);
}

// Update title colors
const targetTitleColor = `className={\`text-2xl md:text-3xl lg:text-4xl leading-tight mb-2 \${templateType === '10' ? 'font-black uppercase tracking-tight' : templateType === '16' ? 'font-black tracking-tighter' : 'font-extrabold'} \${isLight ? 'text-stone-900' : 'text-white'}\`}`;
const replaceTitleColor = `className={\`text-2xl md:text-3xl lg:text-4xl leading-tight mb-2 \${templateType === '10' ? 'font-black uppercase tracking-tight' : templateType === '16' ? 'font-black tracking-tighter' : 'font-extrabold'} \${templateType === '19' ? 'text-[#FF9B00]' : templateType === '20' ? 'text-[#FF4060]' : (isLight ? 'text-stone-900' : 'text-white')}\`}`;

code = code.replace(targetTitleColor, replaceTitleColor);

// Update singer/author color
const targetAuthorColor = `className={\`text-sm md:text-base font-bold text-center mb-1 relative z-30 \${templateType === '6' ? 'text-pink-600' : 'text-teal-500'}\`}`;
const replaceAuthorColor = `className={\`text-sm md:text-base font-bold text-center mb-1 relative z-30 \${templateType === '6' ? 'text-pink-600' : templateType === '19' ? 'text-[#2DD4BF]' : templateType === '20' ? 'text-[#3B82F6]' : 'text-teal-500'}\`}`;
code = code.replace(targetAuthorColor, replaceAuthorColor);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated title and author colors");
