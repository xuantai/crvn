const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [artistRoleId, setArtistRoleId] = useState('');",
  "const [artistRoleId, setArtistRoleId] = useState('');\n  const [artistMembershipTier, setArtistMembershipTier] = useState('');"
);

// 2. Add to openEditModal
code = code.replace(
  "setArtistRoleId((artist as any).roleId || '');",
  "setArtistRoleId((artist as any).roleId || '');\n    setArtistMembershipTier((artist as any).membershipTier || '');"
);

// 3. Add to resetForm
code = code.replace(
  "setArtistRoleId('');",
  "setArtistRoleId('');\n    setArtistMembershipTier('');"
);

// 4. Add to create/update fetch payloads
code = code.replace(
  "roleId: artistRoleId",
  "roleId: artistRoleId,\n          membershipTier: artistMembershipTier"
);

// 5. Add to UI forms
const uiCode = `
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên</label>
                <select
                  value={artistMembershipTier}
                  onChange={(e) => setArtistMembershipTier(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">Thành viên thường (Free)</option>
                  <option value="vip" className="bg-neutral-900 text-white">Thành viên VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">Thành viên PRO</option>
                </select>
              </div>`;

code = code.replace(
  /<div>\s*<label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phân quyền tài khoản \(Role\)/g,
  uiCode + '\n              <div>\n                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phân quyền tài khoản (Role)'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
