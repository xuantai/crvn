import re

with open('server.ts', 'r') as f:
    content = f.read()

# in getLocalData fallback
defaultDataReplacement = """
    playlists: [],
    menus: [
      { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
      { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
      { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
    ],
    aboutMe: {},
    biography: { education: [], experience: [] },
    adminPassword: currentAdminPasswordLocal,
"""
content = re.sub(r'playlists: \[\],\s*adminPassword: currentAdminPasswordLocal,', defaultDataReplacement.strip() + ',', content)

with open('server.ts', 'w') as f:
    f.write(content)

print("server.ts patched again")
