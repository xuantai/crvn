const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const loginBlock = `  app.post('/api/admin/login', (req: any, res) => {
    const { username, password } = req.body;
    let artist = req.artist;
    if (username) {
      artist = artists.find(a => a.username.toLowerCase() === username.toLowerCase().trim());
    }
    const isMatch = artist && artist.password && (
      (artist.password.startsWith('$2a$') || artist.password.startsWith('$2b$')) 
        ? bcrypt.compareSync(password, artist.password) 
        : artist.password === password
    );
    if (isMatch) {
      res.setHeader('Set-Cookie', [
        \`adminToken_\${artist.username}=\${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\`,
        \`adminToken=\${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\`
      ]);
      res.json({ success: true, token: artist.password, extension: artist.extension, username: artist.username, artist });
    } else {
      res.status(401).json({ error: 'Username hoặc mật khẩu không chính xác!' });
    }
  });

  app.post('/api/admin/logout', (req: any, res) => {`;

// We will find `app.post('/api/admin/login'` and `app.post('/api/admin/logout'` and replace everything in between.
let startIdx = lines.findIndex(l => l.includes(`app.post('/api/admin/login'`));
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].includes(`const cookieHeaders = [`)) { // Find something inside logout
    endIdx = i - 2; // the line app.post('/api/admin/logout'
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, loginBlock);
}

fs.writeFileSync('server.ts', lines.join('\n'));
