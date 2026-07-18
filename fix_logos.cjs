const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove giant background logos
const regexGiantLogos = /<motion\.img[^>]*src=\{demo(?:\?)?\.brandLogoUrl\}[^>]*className="[^"]*(?:opacity-\[0\.25\]|opacity-\[0\.2\]|opacity-\[0\.12\]|opacity-\[0\.35\])[^"]*"[^>]*>[\s\S]*?<\/motion\.img>/g;

let count1 = 0;
code = code.replace(regexGiantLogos, () => {
    count1++;
    return '';
});

// Remove empty fragments left behind
const fragmentRegex = /\{demo\?\.brandLogoUrl && \(\s*<>\s*<\/>\s*\)\}/g;
code = code.replace(fragmentRegex, '');

// Also remove this block:
/*
          <div className="relative w-full py-4 -my-4 flex flex-col items-center">
            {demo.isBrand && demo.brandLogoUrl && (
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
                <motion.div 
                  className="absolute inset-0 pointer-events-none z-0 opacity-45 blur-3xl"
                  style={{
                    background: `radial-gradient(circle, ${brandColors?.primary || '#6366f1'}40 0%, transparent 70%)`
                  }}
                  ...
                />
              </div>
            )}
*/
// It's easier to just find the entire `demo.isBrand && demo.brandLogoUrl && (` block in the `relative w-full py-4` container and strip it.
// Actually, I can just use a regular expression to match the specific `demo.isBrand && demo.brandLogoUrl && (...)` block that renders the radial gradient.

const regexGradientBg = /\{demo\.isBrand && demo\.brandLogoUrl && \(\s*<div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">[\s\S]*?<\/div>\s*\)\}/g;
let count2 = 0;
code = code.replace(regexGradientBg, () => { count2++; return ''; });


// Fix the small logo to not have background
const smallLogoTarget = `{demo.brandLogoUrl && (
                  <div 
                    className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center p-0.5 bg-white/10"
                    style={{ border: \`1px solid \${badgeStyle.borderColor}\` }}
                  >
                    <img src={demo.brandLogoUrl} className="w-full h-full object-contain" alt={demo.brandName} referrerPolicy="no-referrer" />
                  </div>
                )}`;

const smallLogoReplacement = `{demo.brandLogoUrl && (
                  <img src={demo.brandLogoUrl} className="w-5 h-5 object-contain" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }} alt={demo.brandName} referrerPolicy="no-referrer" />
                )}`;

// Replace globally (it appears in a few places for different templates)
let count3 = 0;
if (code.includes(smallLogoTarget)) {
    code = code.replaceAll(smallLogoTarget, smallLogoReplacement);
    count3++;
}

// Another instance might have demo?.brandLogoUrl or slightly different formatting.
// Let's use a regex to replace all variants of the mini logo container
const regexMiniLogo = /\{demo(?:\?)?\.brandLogoUrl && \(\s*<div\s+className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center p-0\.5 [^>]+>\s*<img src=\{demo(?:\?)?\.brandLogoUrl\}[^>]+>\s*<\/div>\s*\)\}/g;
let count4 = 0;
code = code.replace(regexMiniLogo, (match) => {
    count4++;
    return `{demo.brandLogoUrl && (
                  <img src={demo.brandLogoUrl} className="w-5 h-5 object-contain shrink-0" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }} alt={demo.brandName} referrerPolicy="no-referrer" />
                )}`;
});

fs.writeFileSync('src/App.tsx', code);
console.log(`Removed ${count1} giant logos, ${count2} gradient bgs, replaced ${count3 + count4} mini logos`);
