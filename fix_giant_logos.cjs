const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The block is:
/*
            {demo?.brandLogoUrl && (
              <>
                <motion.img 
                  src={demo.brandLogoUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-2xl pointer-events-none z-0" 
                  alt="" 
                  referrerPolicy="no-referrer"
                  animate={{
                    scale: [1.4, 1.55, 1.4],
                    rotate: [0, 5, -5, 0],
                    opacity: [0.12, 0.2, 0.12]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.img 
                  src={demo.brandLogoUrl} 
                  className="absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.35] blur-[0.5px] pointer-events-none z-0" 
                  alt="" 
                  referrerPolicy="no-referrer"
                  animate={{
                    y: [0, -4, 2, -3, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </>
            )}
*/
// It's much easier to just delete any `{demo?.brandLogoUrl && (\s*<>\s*<motion\.img[\s\S]*?<\/>\s*\)\}` block.

const regexGiantLogos2 = /\{demo\?\.brandLogoUrl && \(\s*<>\s*<motion\.img[\s\S]*?<\/>\s*\)\}/g;

let count = 0;
code = code.replace(regexGiantLogos2, () => {
    count++;
    return '';
});

// There is also `{demo.isBrand && demo.brandLogoUrl && (` which might have left over things? Wait, I already removed the gradient one. Let's see if there are any other giant logos.
const regexGiantLogos3 = /<motion\.img[\s\S]*?src=\{demo\?\.brandLogoUrl\}[\s\S]*?<\/motion\.img>/g;
code = code.replace(regexGiantLogos3, '');

fs.writeFileSync('src/App.tsx', code);
console.log(`Removed ${count} giant logo blocks.`);
