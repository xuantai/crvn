const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu mới phải từ 4 ký tự trở lên!' });
    }
    const data = await loadData((req as any).artist?.username);


  app.post('/api/admin/change-email',`;

const replacement = `    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu mới phải từ 4 ký tự trở lên!' });
    }
    const data = await loadData((req as any).artist?.username);
    const hashedNewPassword = require('bcrypt').hashSync(newPassword, 10);
    data.adminPassword = hashedNewPassword;
    await saveData(data);
    
    artist.password = hashedNewPassword;
    await saveArtists(artists);
    
    res.json({ success: true });
  });

  app.post('/api/admin/change-email',`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced successfully!");
} else {
    console.log("Target not found!");
}
