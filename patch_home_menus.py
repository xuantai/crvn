import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I'll create a defaultMenus array inside Home or just replace `data.menus` with `data.menus || defaultMenus`
default_menus = """
  const defaultMenus = [
    { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
  ];
  const currentMenus = data.menus && data.menus.length > 0 ? data.menus : defaultMenus;
  const activeMenuObj = currentMenus.find((m: any) => m.id === activeMenuTab);
"""
content = content.replace("const activeMenuObj = data.menus?.find((m: any) => m.id === activeMenuTab);", default_menus)

# Also update PublicNavbar call
content = content.replace("menus={data.menus}", "menus={currentMenus}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

