const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8').split('\n');

for(let i=3090; i<3120; i++) {
  if (code[i] && code[i].includes('const data = await loadData((req as any).artist?.username);')) {
     if (code[i+3] && code[i+3].includes('app.post(\'/api/admin/change-email\'')) {
        console.log("Found it at line " + i);
        code.splice(i+1, 0, 
        '    const hashedNewPassword = require("bcrypt").hashSync(newPassword, 10);',
        '    data.adminPassword = hashedNewPassword;',
        '    await saveData(data);',
        '    artist.password = hashedNewPassword;',
        '    await saveArtists(artists);',
        '    res.json({ success: true });',
        '  });'
        );
        fs.writeFileSync('server.ts', code.join('\n'));
        console.log("Fixed!");
        break;
     }
  }
}
