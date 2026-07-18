const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const oldAddRoleJSX = `              <div>
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
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phân quyền tài khoản (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">Mặc định (Toàn quyền hệ thống)</option>
                  {roles.map((r: any, idx: number) => (
                    <option key={idx} value={r.name} className="bg-neutral-900 text-white">
                      {r.name} (Giới hạn: {r.maxPosts === -1 || r.maxPosts === 'unlimited' ? 'Không giới hạn' : \`\${r.maxPosts} bài\`})
                    </option>
                  ))}
                </select>
              </div>`;

const newRoleJSX = `              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">FREE (Mặc định)</option>
                  <option value="vip" className="bg-neutral-900 text-white">VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số bài tối đa (Để trống: theo hạng)</label>
                <input 
                  type="number"
                  value={artistMaxSongs}
                  onChange={(e) => setArtistMaxSongs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Để trống sẽ áp dụng giới hạn theo Hạng thành viên"
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>`;

code = code.replace(oldAddRoleJSX, newRoleJSX);
code = code.replace(oldAddRoleJSX, newRoleJSX);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
