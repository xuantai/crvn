const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetIf = `  } else if (templateType === '18') {
    themeClasses = "bg-slate-900 text-amber-50 font-sans";
    accentClass = "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-full font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)]";
  }`;

const replaceIf = `  } else if (templateType === '18') {
    themeClasses = "bg-slate-900 text-amber-50 font-sans";
    accentClass = "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-full font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)]";
  } else if (templateType === '19') {
    themeClasses = "bg-gradient-to-br from-[#402314] via-[#2F1A0F] to-[#1C0F08] text-[#E5B582] font-sans";
    accentClass = "bg-[#D95B16] hover:bg-[#C24E11] text-white rounded-full font-bold shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase tracking-wider";
  } else if (templateType === '20') {
    themeClasses = "bg-gradient-to-br from-[#FFD6D6] via-[#FFC0CB] to-[#FFA07A] text-[#D8436B] font-sans";
    accentClass = "bg-[#FF9B00] hover:bg-[#E88C00] text-white rounded-full font-bold shadow-[0_4px_10px_rgba(255,155,0,0.4)] uppercase tracking-wider";
  }`;

code = code.replace(targetIf, replaceIf);
fs.writeFileSync('src/App.tsx', code);
console.log("Added template 19 and 20 vars");
