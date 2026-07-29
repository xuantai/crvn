const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'roleId: req.artist?.roleId || \'\',\n      maxSongs: req.artist?.maxSongs,',
  'roleId: req.artist?.roleId || \'\',\n      maxSongs: req.artist?.maxSongs,\n      maxTemplates: req.artist?.maxTemplates,\n      vipExpiry: req.artist?.vipExpiry,'
);

fs.writeFileSync('server.ts', code);
