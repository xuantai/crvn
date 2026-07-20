const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add isGoldTheme to SocialCarousel props
code = code.replace(
  /function SocialCarousel\(\{ data, pushDown = false \}: \{ data: AppData, pushDown\?: boolean \}\) \{/g,
  "function SocialCarousel({ data, pushDown = false, isGoldTheme = false }: { data: AppData, pushDown?: boolean, isGoldTheme?: boolean }) {"
);

// 2. Pass isGoldTheme to SocialCarousel when used
code = code.replace(
  /<SocialCarousel data=\{data\} pushDown=\{pushDown\} \/>/g,
  "<SocialCarousel data={data} pushDown={pushDown} isGoldTheme={isGoldTheme} />"
);

// 3. Update the button classes in SocialCarousel
code = code.replace(
  /className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white\/10 backdrop-blur-md border border-white\/20 text-white hover:bg-white\/20 hover:scale-110 shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\] transition-all cursor-pointer"/g,
  "className={`relative flex items-center justify-center w-10 h-10 rounded-full ${isGoldTheme ? 'bg-[#1A1303]/90 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'} backdrop-blur-md border hover:scale-110 shadow-md transition-all cursor-pointer`}"
);

code = code.replace(
  /className=\{\`flex items-center justify-center w-10 h-10 rounded-full bg-black\/40 backdrop-blur-md border border-white\/10 text-white \$\{social\.color\} hover:scale-110 shadow-lg transition-all\`\}/g,
  "className={`flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border hover:scale-110 shadow-lg transition-all ${isGoldTheme ? 'bg-[#1A1303]/90 border-[#D4AF37]/40 text-[#D4AF37] ' + social.color.replace('hover:bg-', 'hover:text-white hover:bg-') : 'bg-black/40 border-white/10 text-white ' + social.color}`}"
);

fs.writeFileSync('src/App.tsx', code);
