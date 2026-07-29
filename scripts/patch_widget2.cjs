const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{session\.activeActivated && \(\s*<a\s*href=\{\`\/\\$\{activeExt\}\/admin\`\}\s*title="Quản trị"\s*className="p-2 bg-white\/10 hover:bg-white\/20 border border-white\/10 text-white rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"\s*>\s*<Settings className="w-4 h-4" \/>\s*<\/a>\s*\)\}/g,
  `<a \n              href={\`/\${activeExt}/admin\`} \n              title="Quản trị"\n              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"\n            >\n              <Settings className="w-4 h-4" />\n            </a>`);

code = code.replace(/text-\[11px\] font-black text-white uppercase tracking-wider leading-tight max-w-\[120px\]/g, 
'text-[11px] font-black text-white uppercase tracking-wider leading-[1.4] py-0.5 max-w-[120px]');

fs.writeFileSync('src/App.tsx', code);
