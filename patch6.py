import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

old_edit = """              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                <input 
                  type="text" 
                  required
                  value={artistExtension}
                  onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="acxuantai"
                />
              </div>"""

new_edit = """              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                <input 
                  type="text" 
                  required
                  value={artistExtension}
                  onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="acxuantai"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>chorus.vn/{"{phần_mở_rộng}"}</strong> HOẶC subdomain <strong>{"{phần_mở_rộng}"}.chorus.vn</strong>
                </p>
              </div>"""

code = code.replace(old_edit, new_edit)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)

