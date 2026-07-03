import re

with open('server.ts', 'r') as f:
    code = f.read()

# For lines 1938-1939: composer & singer default
code = code.replace("composer: req.body.composer || 'A.C Xuân Tài',", "composer: req.body.composer || data.artistName || 'Nghệ sĩ',")
code = code.replace("singer: req.body.singer || 'A.C Xuân Tài',", "singer: req.body.singer || data.artistName || 'Nghệ sĩ',")

# For lines 2033-2036
code = code.replace("updatedData.composer = 'A.C Xuân Tài';", "updatedData.composer = data.artistName || 'Nghệ sĩ';")
code = code.replace("updatedData.singer = 'A.C Xuân Tài';", "updatedData.singer = data.artistName || 'Nghệ sĩ';")

# For index.html injection lines 2776, 2777, 2785
code = code.replace("data.artistName || 'A.C Xuân Tài'", "data.artistName || 'Nghệ sĩ'")

# For line 2814
code = code.replace("activeSong.composer || 'A.C Xuân Tài';", "activeSong.composer || data.artistName || 'Nghệ sĩ';")

# For line 2843
code = code.replace("ogTitle = `${playlist.title} - A.C Xuân Tài`;", "ogTitle = `${playlist.title} - ${data.artistName || 'Nghệ sĩ'}`;")

with open('server.ts', 'w') as f:
    f.write(code)

