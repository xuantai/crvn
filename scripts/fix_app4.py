with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_block = """  const defaultMenus = [
    { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
  ];
  const currentMenus = data.menus && data.menus.length > 0 ? data.menus : defaultMenus;
  const activeMenuObj = currentMenus.find((m: any) => m.id === activeMenuTab);
  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) ||||||"""

parts = content.split(bad_block)
print(f"Found {len(parts)} parts")

correct_block_home = """  const defaultMenus = [
    { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
  ];
  const currentMenus = data.menus && data.menus.length > 0 ? data.menus : defaultMenus;
  const activeMenuObj = currentMenus.find((m: any) => m.id === activeMenuTab);
  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) || (data.biography.experience && data.biography.experience.length > 0)));
  
  const finalMenus = currentMenus.filter((m: any) => {
    if (m.type === 'about' && !hasAbout) return false;
    if (m.type === 'bio' && !hasBio) return false;
    return true;
  });
  const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;
  const isVault = !hasNavbar || !activeMenuObj || activeMenuObj.type === 'vault';
  const isAbout = hasNavbar && activeMenuObj?.type === 'about';
  const isBio = hasNavbar && activeMenuObj?.type === 'bio';
  const pushDown = hasNavbar && !isScrolled;
"""

if len(parts) > 1:
    # First part corresponds to the first occurrence (Home component)
    new_content = parts[0] + correct_block_home
    # For the rest, we just append parts[i] because the bad block shouldn't be there at all!
    for i in range(1, len(parts)):
        new_content += parts[i]
        
    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed")
