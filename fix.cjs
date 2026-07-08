const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

// Find the admin login
let idx1 = lines.findIndex(l => l.includes(`const isMatch = artist && artist.password && (`));
if(idx1 !== -1) {
   lines[idx1] = `    const isMatch = artist && artist.password && ((artist.password.startsWith('$2a$') || artist.password.startsWith('$2b$')) ? bcrypt.compareSync(password, artist.password) : artist.password === password);`;
   lines[idx1 + 1] = `    if (isMatch) {`;
   lines[idx1 + 2] = `      res.setHeader('Set-Cookie', [`; // the rest is fine if we delete the old stuff
}

let idx2 = lines.findIndex(l => l.includes(`const isMatch = mPass && (`));
if(idx2 !== -1) {
   lines[idx2] = `    const isMatch = mPass && ((mPass.startsWith('$2a$') || mPass.startsWith('$2b$')) ? bcrypt.compareSync(password, mPass) : mPass === password);`;
   lines[idx2 + 1] = `    if (isMatch) {`;
   lines[idx2 + 2] = `      res.setHeader('Set-Cookie', \`memberToken=\${mPass}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000\`);`;
}

fs.writeFileSync('server.ts', lines.join('\n'));
