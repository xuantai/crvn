import sys

with open("src/components/ChorusVNLanding.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add LogOut to lucide-react imports
import_target = "UserPlus, RefreshCw, Search } from 'lucide-react';"
import_repl = "UserPlus, RefreshCw, Search, LogOut } from 'lucide-react';"
content = content.replace(import_target, import_repl)

# Add logout button next to greeting
greeting_target = """          {loggedInArtist ? (
            <div className="mt-2 text-sm">
              <a href={`/${loggedInArtist.extension}/admin`} className="font-semibold text-neutral-600 hover:text-black transition-colors">
                {lang === 'vi' ? `Xin Chào, ${loggedInArtist.artistName}` : `Hello, ${loggedInArtist.artistName}`}
              </a>
            </div>
          ) : ("""

greeting_repl = """          {loggedInArtist ? (
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

content = content.replace(greeting_target, greeting_repl)

with open("src/components/ChorusVNLanding.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("ChorusVNLanding patched")
