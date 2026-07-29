import sys

with open("src/components/ChorusVNLanding.tsx", "r", encoding="utf-8") as f:
    content = f.read()

greeting_target = """          {loggedInArtist ? (
            <div className="mt-3 text-sm flex items-center justify-center gap-3">
              <a href={`/${loggedInArtist.extension}/admin`} className="font-semibold text-neutral-600 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm">
                {lang === 'vi' ? `Xin Chào, ${loggedInArtist.artistName}` : `Hello, ${loggedInArtist.artistName}`}
              </a>
              <button 
                onClick={async () => {
                  try {
                    localStorage.removeItem('chorus_admin_token');
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.reload();
                  } catch (e) {}
                }}
                className="text-neutral-500 hover:text-red-500 font-bold transition-colors text-[11px] uppercase tracking-wider flex items-center gap-1 bg-white hover:bg-red-50 px-3 py-1.5 rounded-full border border-neutral-200"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" /> {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
              </button>
            </div>
          ) : ("""

greeting_repl = """          {loggedInArtist ? (
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
                      localStorage.removeItem('chorus_admin_token');
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

content = content.replace(greeting_target, greeting_repl)

if "UserCircle," not in content and "UserCircle " not in content:
    content = content.replace("from 'lucide-react';", "UserCircle } from 'lucide-react';")

with open("src/components/ChorusVNLanding.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Greeting patched")
