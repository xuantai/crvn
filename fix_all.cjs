const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const badBlock = `    const data = await loadData((req as any).artist?.username);
    const hashedNewPassword = require("bcrypt").hashSync(newPassword, 10);
    data.adminPassword = hashedNewPassword;
    await saveData(data);
    artist.password = hashedNewPassword;
    await saveArtists(artists);
    res.json({ success: true });
  });`;

code = code.split(badBlock).join(`    const data = await loadData((req as any).artist?.username);`);
fs.writeFileSync('server.ts', code);
