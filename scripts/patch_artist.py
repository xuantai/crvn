import re

with open('server.ts', 'r') as f:
    code = f.read()

new_logic = """    if (ext) {
      const artist = artists.find(a => a.extension === ext || a.username === ext);
      if (artist) return artist;
      
      // Auto-create artist dynamically for subdomains to prevent falling back to acxuantai
      const newArtist = {
        id: Math.random().toString(36).substring(2, 15),
        artistName: ext,
        username: ext,
        extension: ext,
        password: "XuanTaiDepTrai",
        verified: false,
        dbConfig: "",
        memberPassword: ""
      };
      artists.push(newArtist);
      saveArtists(artists).catch(e => console.error(e));
      return newArtist;
    }
    return artists.find(a => a.username === 'acxuantai') || artists[0] || { username: 'acxuantai', artistName: 'A.C Xuân Tài', password: 'XuanTaiDepTrai' };"""

code = re.sub(
    r'if \(ext\) \{\s*const artist = artists.find\(a => a.extension === ext \|\| a.username === ext\);\s*if \(artist\) return artist;\s*\}\s*return artists.find\(a => a.username === \'acxuantai\'\) \|\| artists\[0\] \|\| \{ username: \'acxuantai\', artistName: \'A\.C Xuân Tài\', password: \'XuanTaiDepTrai\' \};',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)
