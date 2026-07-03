import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

new_logic = """                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ</label>
                  {data.pendingNameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingNameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('name')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Username (Phần mở rộng)</label>
                  {data.pendingUsernameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingUsernameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('username')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
                  )}
                </div>"""

code = re.sub(
    r'                <div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ</label>\s*<input name="artistName" defaultValue=\{data\.artistName\} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />\s*</div>\s*<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Username \(Phần mở rộng\)</label>\s*<input name="username" defaultValue=\{data\.username\} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />\s*</div>\s*\{\(data\.pendingNameChange \|\| data\.pendingUsernameChange\) && \(\s*<div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">\s*<div className="text-amber-500 mt-0\.5"><Lock className="w-5 h-5" /></div>\s*<div>\s*<h4 className="font-bold text-amber-800 text-sm">Đang chờ Admin duyệt</h4>\s*<p className="text-sm text-amber-700 mt-1">Yêu cầu thay đổi \{data\.pendingNameChange \? \'Tên nghệ sĩ\' : \'\'\} \{data\.pendingNameChange && data\.pendingUsernameChange \? \'và\' : \'\'\} \{data\.pendingUsernameChange \? \'Username\' : \'\'\} đang chờ ban quản trị xét duyệt\.</p>\s*</div>\s*</div>\s*\)\}',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(code)
