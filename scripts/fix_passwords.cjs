const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const mangled = "const isMatch = artist && artist.password && (\\n      (artist.password.startsWith('$2a      res.setHeader('Set-Cookie', [";
const correct = `const isMatch = artist && artist.password && (
      (artist.password.startsWith('$2a$') || artist.password.startsWith('$2b$')) 
        ? bcrypt.compareSync(password, artist.password) 
        : artist.password === password
    );
    if (isMatch) {
      res.setHeader('Set-Cookie', [`;

code = code.replace(mangled, correct);

const mangledMember = "const isMatch = mPass && (\\n      (mPass.startsWith('$2a      res.setHeader('Set-Cookie'";
const correctMember = `const isMatch = mPass && (
      (mPass.startsWith('$2a$') || mPass.startsWith('$2b$')) 
        ? bcrypt.compareSync(password, mPass) 
        : mPass === password
    );
    if (isMatch) {
      res.setHeader('Set-Cookie'`;

code = code.replace(mangledMember, correctMember);

fs.writeFileSync('server.ts', code);
