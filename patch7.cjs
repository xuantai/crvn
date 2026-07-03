const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/to="\/admin"/g, 'to={getAdminLink()}');
fs.writeFileSync('src/App.tsx', code);
