const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Hide gradient mask for 19 and 20
const targetMask = `templateType === '16' ? 'hidden' : ''}`;
const replaceMask = `templateType === '16' || templateType === '19' || templateType === '20' ? 'hidden' : ''}`;
code = code.replace(targetMask, replaceMask);

// Add badge styling for 19 and 20
const targetBadge = `templateType === '16' ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl' :
                        'bg-rose-600/95 text-white border border-white/25 rounded-md tracking-wider'`;
const replaceBadge = `templateType === '16' ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl' :
                        templateType === '19' ? 'bg-[#D95B16] text-white border border-[#D95B16] font-sans tracking-widest rounded-full' :
                        templateType === '20' ? 'bg-[#FF9B00] text-white border-2 border-white rounded-full font-sans -rotate-3' :
                        'bg-rose-600/95 text-white border border-white/25 rounded-md tracking-wider'`;
code = code.replace(targetBadge, replaceBadge);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated masks and badges");
