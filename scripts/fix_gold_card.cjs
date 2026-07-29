const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Change the background of the achievement card to dark/blur in Gold Theme
code = code.replace(
  /<div className=\{\`absolute inset-\[1px\] rounded-\[15px\] \$\{isGoldTheme \? 'bg-gradient-to-tr from-\[\#E2C373\] via-\[\#D3B158\] to-\[\#B89742\]' : 'bg-neutral-900\/80 backdrop-blur-md'\} z-0\`\} \/>/,
  `<div className={\`absolute inset-[1px] rounded-[15px] \${isGoldTheme ? 'bg-[#140F03]/95 backdrop-blur-xl' : 'bg-neutral-900/80 backdrop-blur-md'} z-0\`} />`
);

// 2. Change the Title text color to white for activeAchievements
code = code.replace(
  /isGoldTheme \? 'text-stone-900 group-hover:text-black' : 'group-hover:text-amber-400'/g,
  "isGoldTheme ? 'text-white group-hover:text-[#D4AF37]' : 'text-white group-hover:text-amber-400'"
);

// 3. Change the Singer text color to light gold/white for activeAchievements
code = code.replace(
  /activeAchievements \? 'text-\[\#7A4B1A\] font-extrabold' : 'text-stone-500 font-bold'/g,
  "activeAchievements ? 'text-amber-200/80 font-bold' : 'text-stone-500 font-bold'"
);

fs.writeFileSync('src/App.tsx', code);
