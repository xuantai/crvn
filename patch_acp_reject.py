import re

with open('src/components/ACPControlPanel.tsx', 'r') as f:
    code = f.read()

new_logic = """                                {artist.pendingNameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi thành: "{artist.pendingNameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveNameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectNameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                                {artist.pendingUsernameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi Username thành: "{artist.pendingUsernameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveUsernameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectUsernameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}"""

code = re.sub(
    r'                                \{artist\.pendingNameChange && \(\s*<div className="mt-1\.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2\.5 rounded-lg text-\[10px\] font-bold">\s*<span>Đang muốn đổi thành: "\{artist\.pendingNameChange\}"</span>\s*<button\s*onClick=\{\(\) => handleApproveNameChange\(artist\.username\)\}\s*className="bg-emerald-500 text-white p-0\.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"\s*title="Duyệt"\s*>\s*<Check className="w-2\.5 h-2\.5 stroke-\[3\]" />\s*</button>\s*</div>\s*\)\}',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('src/components/ACPControlPanel.tsx', 'w') as f:
    f.write(code)
