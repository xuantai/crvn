const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'isSpecial, roleId } = req.body;',
  'isSpecial, roleId, maxSongs } = req.body;'
);
code = code.replace(
  'roleId: roleId || ""',
  'roleId: roleId || "",\n      maxSongs: maxSongs !== undefined ? maxSongs : null'
);

code = code.replace(
  'isSpecial, roleId } = req.body;',
  'isSpecial, roleId, maxSongs } = req.body;'
);

code = code.replace(
  'artist.roleId = artist.roleId || "";\n      }',
  'artist.roleId = artist.roleId || "";\n      }\n      if (maxSongs !== undefined) artist.maxSongs = maxSongs;'
);

code = code.replace(
  'roleId: req.artist?.roleId || \'\',',
  'roleId: req.artist?.roleId || \'\',\n      maxSongs: req.artist?.maxSongs,'
);

fs.writeFileSync('server.ts', code);
