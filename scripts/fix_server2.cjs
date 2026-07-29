const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = "    const data = await loadData((req as any).artist?.username);\n  app.post('/api/admin/change-email',";
const toInsert = `    const hashedNewPassword = require('bcrypt').hashSync(newPassword, 10);
    data.adminPassword = hashedNewPassword;
    await saveData(data);
    
    artist.password = hashedNewPassword;
    await saveArtists(artists);
    
    res.json({ success: true });
  });

  app.post('/api/admin/change-email',`;

code = code.replace(targetStr, "    const data = await loadData((req as any).artist?.username);\n" + toInsert);

fs.writeFileSync('server.ts', code);
