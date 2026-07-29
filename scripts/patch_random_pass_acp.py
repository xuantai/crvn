import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

acp_pass_add = """              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="text" 
                  required
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Mật khẩu của họ"
                />
              </div>"""

acp_pass_edit = """              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="text" 
                  required
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>"""

code = re.sub(
    r'<div>\s*<label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mật khẩu \*</label>\s*<input\s*type="text"\s*required\s*value=\{artistPassword\}\s*onChange=\{\(e\) => setArtistPassword\(e.target.value\)\}\s*className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"\s*placeholder="Mật khẩu của họ"\s*/>\s*</div>',
    acp_pass_add,
    code,
    flags=re.DOTALL
)

code = re.sub(
    r'<div>\s*<label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mật khẩu \*</label>\s*<input\s*type="text"\s*required\s*value=\{artistPassword\}\s*onChange=\{\(e\) => setArtistPassword\(e.target.value\)\}\s*className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"\s*/>\s*</div>',
    acp_pass_edit,
    code,
    flags=re.DOTALL
)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)

