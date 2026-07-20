const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Fix Marquee text-center on vertical cards
code = code.replace(
  /\} text-xs mt-1 text-center mb-4 z-10 w-full px-2\`\}>/g,
  "} text-xs mt-1 text-center justify-center mb-4 z-10 w-full px-2`}>"
);

// 2. Fix Nhạc Thương Hiệu text color
code = code.replace(
  /<p className="text-neutral-400 font-medium text-\[8px\] xs:text-\[9px\] mt-0\.5 truncate tracking-wider flex items-center gap-1\.5">/g,
  `<p className="text-neutral-200 font-medium text-[8px] xs:text-[9px] mt-0.5 truncate tracking-wider flex items-center gap-1.5">`
);

// 3. Fix demo.isBrand singer text color in list item cards
code = code.replace(
  /demo\.isBrand \n     \? 'text-neutral-400'/g,
  "demo.isBrand \n     ? 'text-neutral-200 font-medium'"
);

fs.writeFileSync('src/App.tsx', code);
