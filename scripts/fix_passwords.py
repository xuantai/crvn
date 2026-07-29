with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace type="text" for newAdminPass
content = content.replace(
    'type="text"\n                      value={newAdminPass}',
    'type="password"\n                      value={newAdminPass}'
)

# Replace type="text" for confirmAdminPass
content = content.replace(
    'type="text"\n                      value={confirmAdminPass}',
    'type="password"\n                      value={confirmAdminPass}'
)

# Replace type="text" for memberPassInput
content = content.replace(
    'type="text"\n                      value={memberPassInput}',
    'type="password"\n                      value={memberPassInput}'
)

# Remove the label and change justify-between to justify-end
old_member_header = """<div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-stone-700">{t("Mật khẩu thành viên hiện tại hoặc mới")}</label>
                      <button type="button" onClick={() => setMemberPassInput(Math.random().toString(36).slice(-8))} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" />{t("Tự sinh Ngẫu Nhiên")}</button>
                    </div>"""

new_member_header = """<div className="flex items-center justify-end mb-2">
                      <button type="button" onClick={() => setMemberPassInput(Math.random().toString(36).slice(-8))} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" />{t("Tự sinh Ngẫu Nhiên")}</button>
                    </div>"""

content = content.replace(old_member_header, new_member_header)

with open('src/App.tsx', 'w') as f:
    f.write(content)

