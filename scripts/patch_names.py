import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Home
code = code.replace(
    "{formatText(demo.singer || demo.author || 'A.C Xuân Tài', true)}",
    "{formatText(demo.singer || demo.author || data?.artistName || 'Nghệ sĩ', true)}"
)
code = code.replace(
    "document.title = data.pageTitle || `${t.dDesc} ${data.artistName || 'A.C Xuân Tài'}`",
    "document.title = data.pageTitle || `${t.dDesc} ${data.artistName || 'Nghệ sĩ'}`"
)

# DemoPlayer and PlaylistPlayer
code = code.replace(
    "let titleSuffix = demo.singer || demo.author || demo.composer || 'A.C Xuân Tài';",
    "let titleSuffix = demo.singer || demo.author || demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ';"
)
code = code.replace(
    "{formatText(demo.singer || demo.author || 'A.C Xuân Tài', !!playlistSongs)}",
    "{formatText(demo.singer || demo.author || (demo as any)?.defaultArtistName || 'Nghệ sĩ', !!playlistSongs)}"
)
code = code.replace(
    "{formatText(demo.composer || 'A.C Xuân Tài', !!playlistSongs)}",
    "{formatText(demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ', !!playlistSongs)}"
)

with open('src/App.tsx', 'w') as f:
    f.write(code)

