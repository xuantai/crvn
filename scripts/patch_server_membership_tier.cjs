const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. In create
code = code.replace(
  'isSpecial, roleId } = req.body;',
  'isSpecial, roleId, membershipTier } = req.body;'
);

code = code.replace(
  'roleId: roleId || null',
  'roleId: roleId || null,\n      membershipTier: membershipTier || null'
);

// 2. In update
code = code.replace(
  'defaultLanguage, artistBio, isSpecial, roleId } = req.body;',
  'defaultLanguage, artistBio, isSpecial, roleId, membershipTier } = req.body;'
);

code = code.replace(
  'artist.roleId = roleId || null;',
  'artist.roleId = roleId || null;\n    artist.membershipTier = membershipTier || null;'
);

fs.writeFileSync('server.ts', code);
