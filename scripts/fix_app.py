import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r"  const defaultMenus = \[\n    \{ id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true \},\n    \{ id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true \},\n    \{ id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true \}\n  \];\n  const currentMenus = data.menus && data.menus.length > 0 \? data.menus : defaultMenus;\n  const activeMenuObj = currentMenus.find\(\(m: any\) => m.id === activeMenuTab\);\n  const hasAbout = Boolean\(data.aboutMe && Object.values\(data.aboutMe\).some\(v => v\)\);\n  const hasBio = Boolean\(data.biography && \(\(data.biography.education && data.biography.education.length > 0\) || \(data.biography.experience && data.biography.experience.length > 0\)\)\);\n  \n  const finalMenus = currentMenus.filter\(\(m: any\) => \{\n    if \(m.type === 'about' && !hasAbout\) return false;\n    if \(m.type === 'bio' && !hasBio\) return false;\n    return true;\n  \}\);\n  const hasNavbar = finalMenus.filter\(\(m: any\) => m.isVisible\).length > 1;\n  const isVault = !hasNavbar || !activeMenuObj || activeMenuObj.type === 'vault';\n  const isAbout = hasNavbar && activeMenuObj\?.type === 'about';\n  const isBio = hasNavbar && activeMenuObj\?.type === 'bio';\n  const pushDown = hasNavbar && !isScrolled;\n"

matches = list(re.finditer(pattern, content))
print(f"Found {len(matches)} matches")

if len(matches) > 1:
    # Build new string
    new_content = content[:matches[1].start()]
    for i in range(1, len(matches) - 1):
        new_content += content[matches[i].end():matches[i+1].start()]
    new_content += content[matches[-1].end():]
    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print(f"Removed {len(matches) - 1} extra occurrences.")
