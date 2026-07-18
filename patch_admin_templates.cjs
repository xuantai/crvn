const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<span className="text-sm sm:text-base font-bold truncate">{landingConfig?.templateNames?.[config.id] || (DEFAULT_VI_NAMES[config.id] ? t(DEFAULT_VI_NAMES[config.id]) : config.name)}</span>`;
const replacement = `<span className="text-sm sm:text-base font-bold truncate">{landingConfig?.templateNames?.[config.id] || (DEFAULT_VI_NAMES[config.id] ? t(DEFAULT_VI_NAMES[config.id]) : config.name)}</span>
               {landingConfig?.templateVip?.[config.id] && (
                 <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
               )}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
