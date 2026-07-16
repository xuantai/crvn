import sys

with open("src/components/ChorusVNLanding.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix nav links
nav_target = """          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-neutral-500">
            <Link to="/pricing" className="hover:text-black transition-colors">
              {lang === 'vi' ? 'Bảng giá' : (lang === 'ko' ? '요금제' : 'Pricing')}
            </Link>
            <Link to="/discover" className="hover:text-black transition-colors">
              {lang === 'vi' ? 'Khám Phá' : (lang === 'ko' ? '탐색' : 'Discover')}
            </Link>
          </nav>"""

nav_repl = """          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-neutral-500">
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Bảng giá' : (lang === 'ko' ? '요금제' : 'Pricing')}
            </a>
            <a href="#artist-showcase" onClick={(e) => { e.preventDefault(); document.getElementById('artist-showcase')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-black transition-colors cursor-pointer">
              {lang === 'vi' ? 'Khám Phá' : (lang === 'ko' ? '탐색' : 'Discover')}
            </a>
          </nav>"""

content = content.replace(nav_target, nav_repl)

with open("src/components/ChorusVNLanding.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Nav links patched")
