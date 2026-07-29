const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The giant background logos are the ones with absolute inset-0 or w-28 h-28
const regex1 = /<motion\.img[^>]*src=\{demo\.brandLogoUrl\}[^>]*className="[^"]*(?:opacity-\[0\.25\]|opacity-\[0\.2\]|opacity-\[0\.12\]|opacity-\[0\.35\])[^"]*"[^>]*>[\s\S]*?<\/motion\.img>/g;

let count = 0;
code = code.replace(regex1, () => {
    count++;
    return '';
});

// There is one place where it was wrapped in a React Fragment <> </> if brandLogoUrl exists:
const fragmentRegex = /\{demo\?\.brandLogoUrl && \(\s*<>\s*<\/>\s*\)\}/g;
code = code.replace(fragmentRegex, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Removed " + count + " giant bg logos");
