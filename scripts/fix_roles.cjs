const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const targetRoles = `{artist.roleId === 'vip' && <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-yellow-500/20 uppercase tracking-wide flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>VIP</span>}
                            {artist.roleId === 'pro' && <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide w-max">PRO</span>}
                            {(!artist.roleId || artist.roleId === 'free') && <span className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase tracking-wide w-max">FREE</span>}`;
const replaceRoles = `<div className="flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  if (!artist.roleId || artist.roleId === 'free') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'free' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={\`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer \${(!artist.roleId || artist.roleId === 'free') ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}\`}
                              >
                                FREE
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'pro') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'pro' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={\`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer \${artist.roleId === 'pro' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}\`}
                              >
                                PRO
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'vip') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'vip' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={\`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1 \${artist.roleId === 'vip' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}\`}
                              >
                                {artist.roleId === 'vip' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>}
                                VIP
                              </button>
                            </div>`;

code = code.replace(targetRoles, replaceRoles);
fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
console.log("Updated roles selection");
