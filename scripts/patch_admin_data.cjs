const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'systemIp: landingConfig.systemIp || \'\',',
  'systemIp: landingConfig.systemIp || \'\',\n      landingConfig: landingConfig,'
);

fs.writeFileSync('server.ts', code);
