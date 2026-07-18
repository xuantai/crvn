const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `        <a href={\`/\${activeExt}\`} className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity" title="Đến kho nhạc">`;

const replacement1 = `        <a href={getArtistAdminRedirect(activeExt, '').replace(/\\/$/, '') || '/'} className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity" title="Đến kho nhạc">`;

const target2 = `          <a 
              href={\`/\${activeExt}/admin\`} `;

const replacement2 = `          <a 
              href={getArtistAdminRedirect(activeExt, 'admin')} `;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/App.tsx', code);
