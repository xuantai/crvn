import re

with open('server.ts', 'r') as f:
    content = f.read()

# I will add handling for aboutMe, biography, menus
patch_str = """
    data.aboutMe = req.body.aboutMe ?? data.aboutMe;
    data.biography = req.body.biography ?? data.biography;
    data.menus = req.body.menus ?? data.menus;
"""

content = content.replace("data.youtubePlaylistUrl = req.body.youtubePlaylistUrl ?? data.youtubePlaylistUrl;", patch_str + "\n    data.youtubePlaylistUrl = req.body.youtubePlaylistUrl ?? data.youtubePlaylistUrl;")

# Also in defaultData we can initialize them
defaultDataReplacement = """
      playlists: [],
      menus: [
        { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
        { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
        { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
      ],
      aboutMe: {},
      biography: { education: [], experience: [] },
      adminPassword: newArtist.password,
"""
content = re.sub(r'playlists: \[\],\s*adminPassword: newArtist.password,', defaultDataReplacement.strip() + ',', content)

# same in firebase wipe
defaultDataReplacement2 = """
        playlists: [],
        menus: [
          { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
          { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
          { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
        ],
        aboutMe: {},
        biography: { education: [], experience: [] },
        adminPassword: currentAdminPassword,
"""
content = re.sub(r'playlists: \[\],\s*adminPassword: currentAdminPassword,', defaultDataReplacement2.strip() + ',', content)

with open('server.ts', 'w') as f:
    f.write(content)

print("server.ts patched")
