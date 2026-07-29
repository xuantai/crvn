const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /className="w-6 h-6 min-\[360px\]:w-7 min-\[360px\]:h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-\[#ff0f7b\] to-\[#f89b29\] p-\[1px\] rounded-md sm:rounded-xl/g,
  'className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff0f7b] to-[#f89b29] p-[1px] rounded-[4px] sm:rounded-xl'
);
code = code.replace(
  /className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-\[5px\] sm:rounded-\[11px\]/g,
  'className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-[3px] sm:rounded-[11px]'
);
code = code.replace(
  /<Play className="w-2\.5 h-2\.5 min-\[360px\]:w-3 min-\[360px\]:h-3 sm:w-4 sm:h-4 text-white ml-0\.5 shadow-sm/g,
  '<Play className="w-2 h-2 min-[360px]:w-2.5 min-[360px]:h-2.5 sm:w-4 sm:h-4 text-white ml-0.5 shadow-sm'
);

code = code.replace(
  /<h4 className={`text-\[7\.5px\] min-\[360px\]:text-\[8\.5px\] sm:text-\[10px\] font-black text-white whitespace-nowrap mt-0\.5 \${isTop1Trending \? 'animate-yt-top1' : 'animate-slow-glow-yt'}`}>/g,
  '<h4 className={`text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 leading-[1.15] flex flex-col ${isLeft ? \'items-start\' : \'items-end\'} ${isTop1Trending ? \'animate-yt-top1\' : \'animate-slow-glow-yt\'}`}>'
);

code = code.replace(
  /TOP \{achievement\.value\} <span className="text-stone-200">\{t\('trending'\)\}<\/span>/g,
  'TOP {achievement.value}</span>\n                   <span className="text-stone-200 drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">{t(\'trending\')}</span>'
);

// TikTok
code = code.replace(
  /className="w-6 h-6 min-\[360px\]:w-7 min-\[360px\]:h-7 sm:w-10 sm:h-10 bg-gradient-to-bl from-\[#00f2fe\] via-black to-\[#fe0979\] p-\[1px\] rounded-md sm:rounded-xl/g,
  'className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-10 sm:h-10 bg-gradient-to-bl from-[#00f2fe] via-black to-[#fe0979] p-[1px] rounded-[4px] sm:rounded-xl'
);
code = code.replace(
  /className="w-full h-full bg-black rounded-\[5px\] sm:rounded-\[11px\] flex/g,
  'className="w-full h-full bg-black rounded-[3px] sm:rounded-[11px] flex'
);
code = code.replace(
  /<TiktokIcon className="w-3 h-3 min-\[360px\]:w-3\.5 min-\[360px\]:h-3\.5/g,
  '<TiktokIcon className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3'
);
code = code.replace(
  /<h4 className="text-\[7\.5px\] min-\[360px\]:text-\[8\.5px\] sm:text-\[10px\] font-black text-white whitespace-nowrap mt-0\.5 animate-slow-glow-tt">/g,
  '<h4 className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-tt">'
);

// Spotify
code = code.replace(
  /className="w-6 h-6 min-\[360px\]:w-7 min-\[360px\]:h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-\[#1ED760\] to-\[#128a3c\] p-\[1px\] rounded-full/g,
  'className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-[#1ED760] to-[#128a3c] p-[1px] rounded-full'
);
code = code.replace(
  /<SpotifyIcon className="w-3 h-3 min-\[360px\]:w-3\.5 min-\[360px\]:h-3\.5/g,
  '<SpotifyIcon className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3'
);
code = code.replace(
  /<h4 className="text-\[7\.5px\] min-\[360px\]:text-\[8\.5px\] sm:text-\[10px\] font-black text-white whitespace-nowrap mt-0\.5 animate-slow-glow-sp">/g,
  '<h4 className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-sp">'
);

// Zing
code = code.replace(
  /className="w-6 h-6 min-\[360px\]:w-7 min-\[360px\]:h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-\[#8B5CF6\] to-\[#6D28D9\] p-\[1px\] rounded-md sm:rounded-xl/g,
  'className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] p-[1px] rounded-[4px] sm:rounded-xl'
);
code = code.replace(
  /className="w-full h-full bg-gradient-to-br from-\[#7C3AED\] to-\[#5B21B6\] rounded-\[5px\] sm:rounded-\[11px\]/g,
  'className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-[3px] sm:rounded-[11px]'
);
code = code.replace(
  /className="font-black text-\[7px\] min-\[360px\]:text-\[8px\] sm:text-xs/g,
  'className="font-black text-[6px] min-[360px]:text-[7px] sm:text-xs'
);
code = code.replace(
  /<h4 className="text-\[7\.5px\] min-\[360px\]:text-\[8\.5px\] sm:text-\[10px\] font-black text-white whitespace-nowrap mt-0\.5 animate-slow-glow-zing">/g,
  '<h4 className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-zing">'
);

fs.writeFileSync('src/App.tsx', code);
