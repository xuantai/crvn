const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/to="\/admin\/new"/g, 'to={getAdminLink(\'/new\')}');
code = code.replace(/navigate\(`\/admin\/edit\/\$\{([^}]+)\}`\)/g, 'navigate(getAdminLink(`/edit/${$1}`))');
code = code.replace(/to={`\/admin\/edit\/\$\{([^}]+)\}`}/g, 'to={getAdminLink(`/edit/${$1}`)}');
code = code.replace(/to={`\/admin\/playlist\/\$\{([^}]+)\}`}/g, 'to={getAdminLink(`/playlist/${$1}`)}');
code = code.replace(/window\.location\.href = '\/admin';/g, 'window.location.href = getAdminLink();');
fs.writeFileSync('src/App.tsx', code);
