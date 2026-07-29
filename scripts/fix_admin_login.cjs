const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(username\) \{\n\s*artist = artists\.find\(.*?\);\n\s*\}\n\s*(.*?)\n\s*\} else \{\n\s*res\.status\(401\)/s;
const replacement = `if (username) {
      artist = artists.find(a => a.username.toLowerCase() === username.toLowerCase().trim());
    }
    
    const isMatch = artist && artist.password && ((artist.password.startsWith('$2a$') || artist.password.startsWith('$2b$')) ? bcrypt.compareSync(password, artist.password) : artist.password === password);
    if (isMatch) {
      res.setHeader('Set-Cookie', [
        \`adminToken_\${artist.username}=\${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\`,
        \`adminToken=\${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\`
      ]);
      res.json({ success: true, token: artist.password, extension: artist.extension, username: artist.username, artist });
    } else {
      res.status(401)`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
