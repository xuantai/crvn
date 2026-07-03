import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Placeholders
code = code.replace(
    'placeholder={`Sáng tác (${appData?.artistName || \'Nghệ sĩ\'})`}',
    'placeholder={appData?.artistName || \'Nghệ sĩ\'}'
)

code = code.replace(
    'placeholder={`Ca sĩ (${appData?.artistName || \'Nghệ sĩ\'})`}',
    'placeholder={appData?.artistName || \'Nghệ sĩ\'}'
)

# 2. Home icon
old_home_icon = """            <Link 
              to="/" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 shadow-sm transition-all duration-300 hover:scale-105 animate-[fade-in_0.3s_ease-out]"
              title="Trang chủ"
              id="admin-top-home-btn"
            >"""
new_home_icon = """            <Link 
              to="/" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 hover:scale-105 animate-[fade-in_0.3s_ease-out]"
              title="Trang chủ"
              id="admin-top-home-btn"
            >"""
code = code.replace(old_home_icon, new_home_icon)

# 3. Create Playlist button
old_buttons = """                      className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Tạo Playlist
                    </button>
                  ) : demosSubTab !== 'trash' ? (
                    <Link to={getAdminLink('/new')} className="bg-stone-900 text-white px-4 py-2 rounded-xl flex items-center justify-center hover:bg-stone-800 transition-colors shadow-sm font-bold" title="Tạo mới bài viết">
                      <Plus className="w-5 h-5" />
                    </Link>"""
new_buttons = """                      className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
                      title="Tạo Playlist"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : demosSubTab !== 'trash' ? (
                    <Link to={getAdminLink('/new')} className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-sm" title="Tạo mới bài viết">
                      <Plus className="w-5 h-5" />
                    </Link>"""
code = code.replace(old_buttons, new_buttons)

with open('src/App.tsx', 'w') as f:
    f.write(code)
