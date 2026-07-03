import re

with open('server.ts', 'r') as f:
    code = f.read()

new_logic = """  app.post('/api/profile/cancel-request', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData();
    const artist = req.artist;
    if (artist) {
      if (req.body.type === 'name') {
        artist.pendingNameChange = undefined;
        data.pendingNameChange = undefined;
      } else if (req.body.type === 'username') {
        artist.pendingUsernameChange = undefined;
        data.pendingUsernameChange = undefined;
      }
      await saveArtists(artists);
      await saveData(artist.username, data);
    }
    res.json({ success: true });
  });

  app.post('/api/profile', async (req: any, res) => {"""

code = re.sub(
    r'  app\.post\(\'/api/profile\', async \(req: any, res\) => \{',
    new_logic,
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)
