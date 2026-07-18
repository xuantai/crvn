const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const tabLinkStr = `
            <button
              onClick={() => setActiveTab('roles')}
              className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              <Shield className="w-4.5 h-4.5" />
              <span>Phân Quyền (Roles)</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
                activeTab === 'vouchers'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              <Lock className="w-4.5 h-4.5" />
              <span>Voucher</span>
            </button>
`;

code = code.replace(
  /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('roles'\)\}[\s\S]*?<\/button>/,
  tabLinkStr
);


fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
