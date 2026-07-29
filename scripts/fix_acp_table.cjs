const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  '<th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>',
  '<th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Role</th>\n                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>'
);

const searchTd = '<td className="p-4 text-sm whitespace-nowrap">';
const insertTd = `
                        <td className="p-4 text-sm font-bold">
                          {(() => {
                            const role = (artist.roleId || 'free').toLowerCase();
                            if (role === 'vip') return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs animate-pulse">VIP ✨</span>;
                            if (role === 'pro') return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs">PRO</span>;
                            return <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs">FREE</span>;
                          })()}
                        </td>
`;

// we need to find the correct place to insert this td. It should be right after the Nghệ Sĩ td.
// Nghệ sĩ td is `<td className="p-4 pl-6">\n...`
code = code.replace(
  '                              </div>\n                            </div>\n                          </div>\n                        </td>\n                        <td className="p-4 text-sm whitespace-nowrap">',
  '                              </div>\n                            </div>\n                          </div>\n                        </td>' + insertTd + '\n                        <td className="p-4 text-sm whitespace-nowrap">'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
