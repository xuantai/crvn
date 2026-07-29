const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/admin\/login', \(req: any, res\) => \{.*?\}\);\n\n  app\.post\('\/api\/admin\/logout'/s;

const replacement = `app.post('/api/admin/login', (req: any, res) => {
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
        \`adminToken=\${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\` // Keep legacy for backward compat
      ]);
      res.json({ success: true, token: artist.password, extension: artist.extension, username: artist.username, artist });
    } else {
      res.status(401).json({ error: 'Username hoặc mật khẩu không chính xác!' });
    }
  });

  app.post('/api/admin/logout'`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
