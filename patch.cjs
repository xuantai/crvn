const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<div className="mt-4 min-h-[40px] flex items-center justify-center text-center px-1 z-10 w-full overflow-hidden">',
  '<div className="mt-4 h-[44px] sm:h-[48px] flex items-center justify-center text-center px-1 z-10 w-full relative">'
);

content = content.replace(
  'className="font-black text-[#AA7C11] text-sm sm:text-base tracking-tight line-clamp-2 leading-tight flex items-center justify-center gap-1"',
  'className="absolute inset-0 px-2 font-black text-[#AA7C11] text-sm sm:text-base tracking-tight line-clamp-2 leading-tight flex items-center justify-center gap-1"'
);

content = content.replace(
  'className="font-black text-[#1A1303] group-hover:text-[#AA7C11] text-sm sm:text-base tracking-tight line-clamp-2 leading-tight transition-colors"',
  'className="absolute inset-0 px-2 flex items-center justify-center font-black text-[#1A1303] group-hover:text-[#AA7C11] text-sm sm:text-base tracking-tight line-clamp-2 leading-tight transition-colors"'
);

content = content.replace(
  '<div className="mb-4 mt-1 z-10 w-full px-2">',
  '<div className="mb-4 mt-1 z-10 w-full px-2 h-[20px] relative">'
);

content = content.replace(
  'className="text-xs text-[#5C3E14] font-bold text-center justify-center flex items-center gap-1.5 w-full"',
  'className="absolute inset-0 text-xs text-[#5C3E14] font-bold text-center justify-center flex items-center gap-1.5 w-full"'
);

content = content.replace(
  '<motion.div key="artist-name-vert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>',
  '<motion.div key="artist-name-vert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 flex items-center justify-center">'
);

fs.writeFileSync('src/App.tsx', content);
