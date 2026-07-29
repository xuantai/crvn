import sys

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add HelpCircle to lucide-react imports if not present
if "HelpCircle," not in content and "HelpCircle " not in content:
    content = content.replace("from 'lucide-react';", "HelpCircle } from 'lucide-react';")

# Add Help link to AdminDashboard header
header_target = """            <Link 
              to={getArtistLink("/")} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
              title={t("Trang chủ")}
              id="admin-top-home-btn"
            >
              <HomeIcon className="w-4 h-4 stroke-[2]" />
            </Link>"""

header_repl = """            {data?.activated !== false && (
              <Link 
                to={getArtistLink("/help")} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
                title={t("Trợ giúp / Quản lý tài khoản")}
              >
                <HelpCircle className="w-4 h-4 stroke-[2]" />
              </Link>
            )}
            <Link 
              to={getArtistLink("/")} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
              title={t("Trang chủ")}
              id="admin-top-home-btn"
            >
              <HomeIcon className="w-4 h-4 stroke-[2]" />
            </Link>"""

content = content.replace(header_target, header_repl)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Admin header patched")
