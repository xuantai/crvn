const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/navigate\('\/admin'\)/g, 'navigate(getAdminLink())');
fs.writeFileSync('src/App.tsx', code);
