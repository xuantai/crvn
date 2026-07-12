import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update useEffect
fetch_callback_replacement = """
        const currentMenus = data.menus && data.menus.length > 0 ? data.menus : [
          { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
          { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
          { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
        ];
        const visibleMenus = currentMenus.filter((m: any) => m.isVisible);
        if (visibleMenus.length > 0) {
          setActiveMenuTab(visibleMenus[0].id);
        } else {
          setActiveMenuTab('m1');
        }
"""
content = re.sub(
    r'if \(data\.menus && data\.menus\.length > 0\) \{.*?\} else \{\s*setActiveMenuTab\(\'m1\'\);\s*\}',
    fetch_callback_replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

