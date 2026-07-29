const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'isSpecial, roleId, membershipTier } = req.body;',
  'isSpecial, roleId } = req.body;'
);
code = code.replace(
  'roleId: roleId || null,\n      membershipTier: membershipTier || null',
  'roleId: roleId || null'
);

code = code.replace(
  'defaultLanguage, artistBio, isSpecial, roleId, membershipTier } = req.body;',
  'defaultLanguage, artistBio, isSpecial, roleId } = req.body;'
);
code = code.replace(
  'artist.roleId = roleId || null;\n    artist.membershipTier = membershipTier || null;',
  'artist.roleId = roleId || null;'
);
fs.writeFileSync('server.ts', code);
