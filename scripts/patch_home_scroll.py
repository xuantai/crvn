import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add isScrolled state in Home
home_state_start = "  const [activeBioSong, setActiveBioSong] = useState<any | null>(null);"
home_state_new = """  const [activeBioSong, setActiveBioSong] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);"""

content = content.replace(home_state_start, home_state_new)

# Now, we need to pass `pushDown={hasNavbar && !isScrolled}`. Wait, we need to define `hasNavbar`.
# Actually, the user asked: "Trường hợp nghệ sĩ không có điền phần tiểu sử và về tôi thì không hiện navbar luôn, chỉ có trang nhạc thôi"
# Let's see how `currentMenus` is formed.
# We will intercept the rendering of PublicNavbar and the menus!

home_render_vars_old = """  const isBio = activeMenuObj?.type === 'bio';"""
home_render_vars_new = """  const isBio = activeMenuObj?.type === 'bio';
  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) || (data.biography.experience && data.biography.experience.length > 0)));
  
  const finalMenus = currentMenus.filter((m: any) => {
    if (m.type === 'about' && !hasAbout) return false;
    if (m.type === 'bio' && !hasBio) return false;
    return true;
  });
  const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;
  const pushDown = hasNavbar && !isScrolled;
"""
content = content.replace(home_render_vars_old, home_render_vars_new)

# Pass pushDown to SocialCarousel
content = content.replace("<SocialCarousel data={data} />", "<SocialCarousel data={data} pushDown={pushDown} />")

# Pass pushDown to LanguageSwitcher
content = content.replace("<LanguageSwitcher />", "<LanguageSwitcher pushDown={pushDown} />")

# Conditionally render PublicNavbar
content = content.replace("<PublicNavbar menus={currentMenus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} />", "{hasNavbar && <PublicNavbar menus={finalMenus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} />}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
