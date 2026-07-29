import re

with open('server.ts', 'r') as f:
    code = f.read()

new_logic = """    if (ext) {
      const artist = artists.find(a => a.extension === ext || a.username === ext);
      if (artist) return artist;
    }
    return artists.find(a => a.username === 'acxuantai') || artists[0] || { username: 'acxuantai', artistName: 'A.C Xuân Tài', password: 'XuanTaiDepTrai' };"""

code = re.sub(
    r'if \(ext\) \{\s*const artist = artists.find\(a => a.extension === ext \|\| a.username === ext\);\s*if \(artist\) return artist;\s*// Auto-create artist dynamically for subdomains to prevent falling back to acxuantai\s*const newArtist = \{\s*id: Math\.random\(\)\.toString\(36\)\.substring\(2, 15\),\s*artistName: ext,\s*username: ext,\s*extension: ext,\s*password: "XuanTaiDepTrai",\s*verified: false,\s*dbConfig: "",\s*memberPassword: ""\s*\};\s*artists\.push\(newArtist\);\s*saveArtists\(artists\)\.catch\(e => console\.error\(e\)\);\s*return newArtist;\s*\}\s*return artists\.find\(a => a\.username === \'acxuantai\'\) \|\| artists\[0\] \|\| \{ username: \'acxuantai\', artistName: \'A\.C Xuân Tài\', password: \'XuanTaiDepTrai\' \};',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)
