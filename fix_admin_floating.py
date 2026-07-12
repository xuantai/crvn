import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """function AdminFloatingControls({ onLogout }: { onLogout: () => void }) {
  const isAdmin = !!getAdminToken();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {"""

replacement = """function AdminFloatingControls({ onLogout }: { onLogout: () => void }) {
  const isAdmin = !!getAdminToken();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { artistData } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {"""

target2 = """        className={
          isListeningPage
            ? "hidden md:flex md:fixed md:left-6 md:top-1/2 md:-translate-y-1/2 z-[100] md:flex-col md:gap-4 md:translate-x-0"
            : "fixed top-6 mt-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 z-[100] flex flex-row gap-4"
        }"""

replacement2 = """        className={
          isListeningPage
            ? "hidden md:flex md:fixed md:left-6 md:top-1/2 md:-translate-y-1/2 z-[100] md:flex-col md:gap-4 md:translate-x-0"
            : `fixed transition-all duration-500 ease-in-out ${pushDown ? 'top-20' : 'top-6'} mt-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 z-[100] flex flex-row gap-4`
        }"""

# Need to compute pushDown just before `return (` in AdminFloatingControls
target3 = """  if (isListeningPage) return null;
  if (isPageLoading) return null;

  return ("""

replacement3 = """  if (isListeningPage) return null;
  if (isPageLoading) return null;

  let pushDown = false;
  if (artistData) {
    const defaultMenus = [
      { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
      { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
      { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
    ];
    const currentMenus = artistData.menus && artistData.menus.length > 0 ? artistData.menus : defaultMenus;
    const hasAbout = Boolean(artistData.aboutMe && Object.values(artistData.aboutMe).some(v => v));
    const hasBio = Boolean(artistData.biography && ((artistData.biography.education && artistData.biography.education.length > 0) || (artistData.biography.experience && artistData.biography.experience.length > 0)));
    const finalMenus = currentMenus.filter((m: any) => {
      if (m.type === 'about' && !hasAbout) return false;
      if (m.type === 'bio' && !hasBio) return false;
      return true;
    });
    const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;
    pushDown = hasNavbar && !isScrolled;
  }

  return ("""

if target in content and target2 in content and target3 in content:
    content = content.replace(target, replacement)
    content = content.replace(target2, replacement2)
    content = content.replace(target3, replacement3)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Replaced all targets successfully.")
else:
    print("Could not find targets.")
    if target not in content: print("Target 1 missing")
    if target2 not in content: print("Target 2 missing")
    if target3 not in content: print("Target 3 missing")
