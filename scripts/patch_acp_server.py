import re

with open('server.ts', 'r') as f:
    code = f.read()

new_logic = """  app.post('/api/acp/artists/update', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { originalUsername, artistName, extension, password, verified, dbConfig, isPublic, approveNameChange, rejectNameChange, approveUsernameChange, rejectUsernameChange } = req.body;
    const artistIdx = artists.findIndex(a => a.username === originalUsername);
    if (artistIdx === -1) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ!' });
    }
    
    const artist = artists[artistIdx];
    
    if (approveNameChange && artist.pendingNameChange) {
      artist.artistName = artist.pendingNameChange;
      artist.pendingNameChange = undefined;
      const data = await loadData(artist.username);
      data.artistName = artist.artistName;
      data.pendingNameChange = undefined;
      await saveData(artist.username, data);
    } else if (rejectNameChange) {
      artist.pendingNameChange = undefined;
      const data = await loadData(artist.username);
      data.pendingNameChange = undefined;
      await saveData(artist.username, data);
    } else if (approveUsernameChange && artist.pendingUsernameChange) {
      // Need to rename the data file and username
      const oldUsername = artist.username;
      const newUsername = artist.pendingUsernameChange;
      
      // Update artist object
      artist.username = newUsername;
      artist.pendingUsernameChange = undefined;
      
      // Load old data, change, save as new, delete old
      const data = await loadData(oldUsername);
      data.username = newUsername;
      data.pendingUsernameChange = undefined;
      await saveData(newUsername, data);
      
      const fs = require('fs');
      const path = require('path');
      try {
        fs.unlinkSync(path.join(process.cwd(), `data_${oldUsername}.json`));
      } catch(e) {}
    } else if (rejectUsernameChange) {
      artist.pendingUsernameChange = undefined;
      const data = await loadData(artist.username);
      data.pendingUsernameChange = undefined;
      await saveData(artist.username, data);
    } else if (!approveNameChange && !rejectNameChange && !approveUsernameChange && !rejectUsernameChange) {
      artist.artistName = artistName || artist.artistName;
      artist.extension = extension ? extension.toLowerCase().trim() : artist.extension;
      artist.password = password || artist.password;
      artist.verified = verified !== undefined ? !!verified : artist.verified;
      artist.isPublic = isPublic !== undefined ? !!isPublic : (artist.isPublic !== false);
      artist.dbConfig = dbConfig !== undefined ? dbConfig : artist.dbConfig;
      
      const data = await loadData(artist.username);
      data.artistName = artist.artistName;
      data.adminPassword = artist.password;
      await saveData(artist.username, data);
    }
    
    await saveArtists(artists);
    res.json({ success: true, artist });
  });"""

code = re.sub(
    r'  app\.post\(\'/api/acp/artists/update\', async \(req, res\) => \{.*?\n    await saveArtists\(artists\);\n    res\.json\(\{ success: true, artist \}\);\n  \}\);',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)
