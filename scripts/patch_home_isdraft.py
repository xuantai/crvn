import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Fix hasReleasedMatches
code = code.replace(
    "data?.demos?.filter(d => d.linkType === 'indirect' || d.status === 'public')",
    "data?.demos?.filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft)"
)

# Fix currentListItems
code = code.replace(
    "(data?.demos.filter(d => d.linkType === 'indirect' || d.status === 'public').filter(d => activeListTab === 'demos' ? (!d.isReleased && d.linkType !== 'indirect') : (d.isReleased || d.linkType === 'indirect')) || [])",
    "(data?.demos.filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft).filter(d => activeListTab === 'demos' ? (!d.isReleased && d.linkType !== 'indirect') : (d.isReleased || d.linkType === 'indirect')) || [])"
)

# Also fix the playlist songs logic in albums
code = code.replace(
    "const songsInPlaylist = data.demos.filter(d => d.status === 'public' && d.playlistIds && d.playlistIds.includes(playlist.id));",
    "const songsInPlaylist = data.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id));"
)
code = code.replace(
    "const songsInPlaylist = data?.demos.filter(d => d.status === 'public' && d.playlistIds && d.playlistIds.includes(playlist.id)) || [];",
    "const songsInPlaylist = data?.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id)) || [];"
)

with open('src/App.tsx', 'w') as f:
    f.write(code)

