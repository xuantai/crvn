const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  /<\/button>\s*<\/aside>/,
  '</button>\n        </div>\n      </aside>'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
