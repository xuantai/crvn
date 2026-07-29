const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `            {data?.isMasterAdmin && (
              <button onClick={() => setActiveTab('database')} className={\`flex items-center transition-colors \${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } \${activeTab === 'database' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'}\`} title="Cơ Sở Dữ Liệu">
                <Database className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Database (Firebase)</span>}
              </button>
            )}`;

if (code.includes(target1)) {
  code = code.replace(target1, '');
  console.log('Removed tab button');
}

const target2 = `{activeTab === 'database' && <AdminDatabaseTab />}`;
if (code.includes(target2)) {
  code = code.replace(target2, '');
  console.log('Removed tab render');
}

fs.writeFileSync('src/App.tsx', code);
