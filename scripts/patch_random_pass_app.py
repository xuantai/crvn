import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. New Admin Password
new_admin_pass = """                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-stone-700">Mật khẩu mới</label>
                      <button type="button" onClick={() => { const p = Math.random().toString(36).slice(-8); setNewAdminPass(p); setConfirmAdminPass(p); }} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Đề xuất Random</button>
                    </div>
                    <input 
                      type="text"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Mật khẩu mới (tối thiểu 4 ký tự)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="text"
                      value={confirmAdminPass}
                      onChange={(e) => setConfirmAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>"""

code = re.sub(
    r'<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu mới</label>\s*<input\s*type="password"\s*value=\{newAdminPass\}\s*onChange=\{\(e\) => setNewAdminPass\(e.target.value\)\}\s*className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"\s*placeholder="Mật khẩu mới \(tối thiểu 4 ký tự\)"\s*/>\s*</div>\s*<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Xác nhận mật khẩu mới</label>\s*<input\s*type="password"\s*value=\{confirmAdminPass\}\s*onChange=\{\(e\) => setConfirmAdminPass\(e.target.value\)\}\s*className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"\s*placeholder="Nhập lại mật khẩu mới"\s*/>\s*</div>',
    new_admin_pass,
    code,
    flags=re.DOTALL
)

# 2. Member Password
member_pass = """                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-stone-700">Mật khẩu thành viên hiện tại hoặc mới</label>
                      <button type="button" onClick={() => setMemberPassInput(Math.random().toString(36).slice(-8))} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Đề xuất Random</button>
                    </div>
                    <input 
                      type="text"
                      value={memberPassInput}
                      onChange={(e) => setMemberPassInput(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Mật khẩu thành viên"
                    />
                  </div>"""

code = re.sub(
    r'<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu thành viên hiện tại hoặc mới</label>\s*<input\s*type="text"\s*value=\{memberPassInput\}\s*onChange=\{\(e\) => setMemberPassInput\(e.target.value\)\}\s*className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"\s*placeholder="Mật khẩu thành viên"\s*/>\s*</div>',
    member_pass,
    code,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(code)

