const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target2 = `          {activeTab === 'database' && (
            <AdminDatabaseSettings />
          )}`;

if (code.includes(target2)) {
  code = code.replace(target2, '');
  console.log('Removed tab render');
}

fs.writeFileSync('src/App.tsx', code);
