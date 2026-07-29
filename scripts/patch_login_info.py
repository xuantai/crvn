import sys

with open("src/components/HelpPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """              <div className="bg-[#111] rounded-2xl p-6 shadow-2xl border border-neutral-800 max-w-xl font-mono text-[13px] sm:text-sm">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                  <h3 className="text-white font-bold">Thông tin kho nhạc nghệ sĩ {artistData?.artistName || artistData?.username}</h3>
                  <button 
                    onClick={() => {
                        const txt = `Nghệ danh: ${artistData?.artistName || artistData?.username}\\nUsername: ${artistData?.username}\\nWebsite: ${artistData?.extension}.chorus.vn\\nAdmin: ${artistData?.extension}.chorus.vn/admin\\nAdmin User: ${artistData?.username}`;
                        navigator.clipboard.writeText(txt);
                    }}
                    className="text-neutral-500 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-800 p-2 rounded-lg"
                    title="Copy info"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4 text-neutral-300">
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Nghệ danh:</span>
                    <span className="font-bold text-white">{artistData?.artistName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Username:</span>
                    <span className="font-bold text-white">{artistData?.username}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4 mt-6 mb-2">
                    <span className="w-28 text-neutral-500 shrink-0">Website:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">{artistData?.extension}.chorus.vn</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Admin:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn/admin`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">{artistData?.extension}.chorus.vn/admin</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Admin User:</span>
                    <span className="font-bold text-white">{artistData?.username}</span>
                  </div>
                </div>
              </div>"""

repl = """              <div className="bg-amber-50/50 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200/60 max-w-xl text-sm">
                <div className="flex items-center justify-between mb-6 border-b border-amber-100 pb-4">
                  <h3 className="text-amber-950 font-black text-lg">Thông tin đăng nhập & Quản lý</h3>
                  <button 
                    onClick={() => {
                        const txt = `Nghệ danh: ${artistData?.artistName || artistData?.username}\\nWebsite: ${artistData?.extension}.chorus.vn\\nAdmin: ${artistData?.extension}.chorus.vn/admin\\nĐăng nhập: ${artistData?.username} hoặc ${artistData?.email}`;
                        navigator.clipboard.writeText(txt);
                    }}
                    className="text-amber-700 hover:text-amber-900 transition-colors bg-white hover:bg-amber-100 p-2 rounded-lg border border-amber-200"
                    title="Copy info"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {artistData?.activated === false && (
                    <div className="mb-6 p-4 bg-orange-100 text-orange-800 rounded-xl font-bold text-sm border border-orange-200">
                        Tài khoản của bạn đang chờ kích hoạt, sau khi kích hoạt thành công bạn có thể đăng nhập với thông tin dưới đây.
                    </div>
                )}
                
                <div className="space-y-4 text-stone-700 font-medium">
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Nghệ danh:</span>
                    <span className="font-black text-stone-900 text-base">{artistData?.artistName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4 mt-6 mb-2">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Website:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline">{artistData?.extension}.chorus.vn</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Trang Admin:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn/admin`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline">{artistData?.extension}.chorus.vn/admin</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Đăng nhập bằng:</span>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">{artistData?.username}</span>
                      <span className="text-stone-400 font-bold text-xs">HOẶC</span>
                      <span className="font-black text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200">{artistData?.email || 'email'}</span>
                    </div>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Mật khẩu:</span>
                    <span className="font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">Mật khẩu do bạn tạo</span>
                  </div>
                </div>
              </div>"""

content = content.replace(target, repl)

with open("src/components/HelpPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("HelpPage login info updated")
