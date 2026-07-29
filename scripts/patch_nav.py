import sys

with open("src/components/ChorusVNLanding.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add showComingSoonModal state
state_target = "  const [showLoginModal, setShowLoginModal] = useState(false);"
state_repl = "  const [showComingSoonModal, setShowComingSoonModal] = useState(false);\n  const [showLoginModal, setShowLoginModal] = useState(false);"
if "const [showComingSoonModal" not in content:
    content = content.replace(state_target, state_repl)

nav_target = """          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-neutral-500">
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Bảng giá' : (lang === 'ko' ? '요금제' : 'Pricing')}
            </a>
            <a href="#artist-showcase" onClick={(e) => { e.preventDefault(); document.getElementById('artist-showcase')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Khám Phá' : (lang === 'ko' ? '탐색' : 'Discover')}
            </a>
          </nav>"""

nav_repl = """          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-neutral-500">
            <a href="#pricing" onClick={(e) => { e.preventDefault(); setShowComingSoonModal(true); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Bảng giá' : (lang === 'ko' ? '요금제' : 'Pricing')}
            </a>
            <a href="#discover" onClick={(e) => { e.preventDefault(); setShowComingSoonModal(true); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Khám Phá' : (lang === 'ko' ? '탐색' : 'Discover')}
            </a>
            {loggedInArtist && (
              <div className="flex items-center bg-white rounded-full p-1 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <a href={`/${loggedInArtist.extension}/admin`} className="px-4 py-1 text-[11px] font-bold text-neutral-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5 uppercase">
                  <UserCircle className="w-4 h-4" />
                  {lang === 'vi' ? `Xin Chào, ${loggedInArtist.artistName}` : `Hello, ${loggedInArtist.artistName}`}
                </a>
                <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                <button 
                  onClick={async () => {
                    try {
                      localStorage.removeItem('adminToken');
                      localStorage.removeItem(`adminToken_${loggedInArtist.extension}`);
                      await fetch('/api/admin/logout', { method: 'POST' });
                      window.location.reload();
                    } catch (e) {}
                  }}
                  title={lang === 'vi' ? 'Đăng xuất' : 'Logout'}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            )}
          </nav>"""

content = content.replace(nav_target, nav_repl)

# Remove the greeting down below
greeting_target = """          {loggedInArtist ? (
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center bg-white rounded-full p-1 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <a href={`/${loggedInArtist.extension}/admin`} className="px-4 py-2 text-sm font-bold text-neutral-800 hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  {lang === 'vi' ? `Xin Chào, ${loggedInArtist.artistName}` : `Hello, ${loggedInArtist.artistName}`}
                </a>
                <div className="w-px h-5 bg-neutral-200 mx-1"></div>
                <button 
                  onClick={async () => {
                    try {
                      localStorage.removeItem('adminToken');
                      localStorage.removeItem(`adminToken_${loggedInArtist.extension}`);
                      await fetch('/api/admin/logout', { method: 'POST' });
                      window.location.reload();
                    } catch (e) {}
                  }}
                  title={lang === 'vi' ? 'Đăng xuất' : 'Logout'}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>
          ) : ("""

greeting_repl = """          {!loggedInArtist && ("""

content = content.replace(greeting_target, greeting_repl)

# Add Coming Soon Modal at the end of the file before last </div>
modal_html = """
      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative text-center"
            >
              <button 
                onClick={() => setShowComingSoonModal(false)}
                className="absolute top-4 right-4 p-2 bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl mx-auto flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-2">Tính năng đang phát triển!</h3>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau nhé!
              </p>
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="w-full bg-black text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-neutral-800 transition-colors"
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

content = content.replace("    </div>\n  );\n}", modal_html + "    </div>\n  );\n}")

with open("src/components/ChorusVNLanding.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Nav & Modal patched")
