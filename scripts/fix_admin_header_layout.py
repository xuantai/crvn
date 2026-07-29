import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We need to replace the section from `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">`
# down to the `</div>` that closes it.

start_str = r'<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">'
# Find the start index
start_idx = content.find(start_str)

if start_idx != -1:
    # Now we want to find the corresponding closing div.
    # Actually, we can just replace the start string to `              <div className="flex flex-col gap-4 mb-6 border-b border-stone-100 pb-4">`
    content = content[:start_idx] + '              <div className="flex flex-col gap-4 mb-6 border-b border-stone-100 pb-4">' + content[start_idx+len(start_str):]
    
    # Now we need to replace the right side, starting from:
    # `                <div className="flex items-center gap-2 self-end md:self-auto">`
    # up to `                  ) : null}` and the closing `</div>`
    
    right_side_start = r'<div className="flex items-center gap-2 self-end md:self-auto">'
    right_idx = content.find(right_side_start, start_idx)
    
    if right_idx != -1:
        # Find the end of this block which is the `                  ) : null}` and `                </div>`
        end_str = r'                  ) : null}\n                </div>'
        end_idx = content.find(end_str, right_idx)
        
        if end_idx != -1:
            end_full_idx = end_idx + len(end_str)
            
            new_right_side = """<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex items-center w-full sm:max-w-md">
                     <input
                        type="text"
                        value={adminSearchQuery}
                        onChange={handleAdminSearchChange}
                        placeholder={t("Tìm kiếm...")}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400 font-medium transition-shadow"
                     />
                     <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                     {adminSearchQuery && (
                        <button
                          onClick={() => setAdminSearchQuery('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                       value={itemsPerPage} 
                       onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                       className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-700 outline-none hover:border-stone-300 focus:ring-2 focus:ring-stone-900 transition-colors cursor-pointer w-full sm:w-auto shrink-0"
                    >
                      <option value={10}>{t("10 bài")}</option>
                      <option value={20}>{t("20 bài")}</option>
                      <option value={50}>{t("50 bài")}</option>
                      <option value={100}>{t("100 bài")}</option>
                    </select>
                    {demosSubTab === 'playlists' ? (
                      <button
                        type="button"
                        onClick={() => setIsCreatePlaylistModalOpen(true)}
                        className="px-4 py-2.5 flex items-center justify-center bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl font-bold text-sm shrink-0 gap-1.5"
                        title={t("Tạo Playlist")}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("Tạo Playlist")}</span>
                      </button>
                    ) : null}
                  </div>
                </div>"""
                
            content = content[:right_idx] + new_right_side + content[end_full_idx:]
            
with open('src/App.tsx', 'w') as f:
    f.write(content)

