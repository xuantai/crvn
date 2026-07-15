const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. !isVault main padding
const mainTarget = `<main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 pt-36 sm:pt-40 md:pt-48">`;
const mainReplacement = `<main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 pt-32 sm:pt-36">`;
if (code.includes(mainTarget)) {
  code = code.replace(mainTarget, mainReplacement);
  console.log("Replaced !isVault main padding");
}

// 2. PublicAboutView mt-24
const aboutTarget = `className="w-full mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 sm:p-10 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start"`;
const aboutReplacement = `className="w-full mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 sm:p-10 mt-4 sm:mt-8 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start"`;
if (code.includes(aboutTarget)) {
  code = code.replace(aboutTarget, aboutReplacement);
  console.log("Replaced PublicAboutView mt-24");
}

// 3. PublicBioView mt-24
const bioTarget = `className={\`w-full mx-auto mt-24 mb-20 relative z-10 px-4 sm:px-8 lg:px-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] py-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white max-w-7xl \${hasEdu && hasExp ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16' : 'flex flex-col'}\`}`;
const bioReplacement = `className={\`w-full mx-auto mt-4 sm:mt-8 mb-20 relative z-10 px-4 sm:px-8 lg:px-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] py-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white max-w-7xl \${hasEdu && hasExp ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16' : 'flex flex-col'}\`}`;
if (code.includes(bioTarget)) {
  code = code.replace(bioTarget, bioReplacement);
  console.log("Replaced PublicBioView mt-24");
}

// 4. renderTitleSection isFirst padding
const titleTarget = `className={\`relative \${isFirst ? 'pt-36 sm:pt-40 md:pt-48' : 'pt-12 sm:pt-16'} pb-10 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[300px]\`}`;
const titleReplacement = `className={\`relative \${isFirst ? 'pt-32 sm:pt-36' : 'pt-12 sm:pt-16'} pb-10 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[300px]\`}`;
if (code.includes(titleTarget)) {
  code = code.replace(titleTarget, titleReplacement);
  console.log("Replaced title section padding");
}

const titleInnerTarget = `<div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-10 sm:mt-14 md:mt-18">`;
const titleInnerReplacement = `<div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-4 sm:mt-6">`;
if (code.includes(titleInnerTarget)) {
  code = code.replace(titleInnerTarget, titleInnerReplacement);
  console.log("Replaced title inner margin");
}

fs.writeFileSync('src/App.tsx', code);
