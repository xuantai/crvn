const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const toInsert = `    // Determine max songs
    const artist = req.artist;
    let maxLimit = 10; // Default for free
    if (artist) {
      const roleId = artist.roleId || 'free';
      if (roleId === 'vip' || roleId === 'pro') {
        maxLimit = -1; // unlimited by default for pro/vip unless overridden
      }
      
      // Check role specific config
      const landingConf = await loadLandingConfig();
      const roleDef = (landingConf.roles || []).find((r: any) => r.name.toLowerCase() === roleId.toLowerCase());
      if (roleDef && roleDef.maxPosts) {
        if (roleDef.maxPosts === -1 || roleDef.maxPosts === 'unlimited') maxLimit = -1;
        else maxLimit = Number(roleDef.maxPosts);
      }
      if (artist.maxSongs !== undefined && artist.maxSongs !== null) {
        maxLimit = artist.maxSongs;
      }
    }
    
    if (maxLimit !== -1) {
      // NOTE: check if this is a draft update or new post?
      // Wait, /api/demos POST creates a NEW post. 
      // Update is handled by /api/demos/:id.
      // So this is for NEW posts only.
      const activeCount = data.demos.filter((d: any) => !d.deleted).length;
      if (activeCount >= maxLimit) {
        return res.status(403).json({ error: \`Bạn đã đạt giới hạn đăng bài (\${maxLimit} bài). Vui lòng nâng cấp hạng thành viên hoặc nhập mã voucher.\` });
      }
    }
`;

code = code.replace(
  "const data = await loadData((req as any).artist?.username);\n    const files = req.files as { [fieldname: string]: Express.Multer.File[] };",
  "const data = await loadData((req as any).artist?.username);\n" + toInsert + "\n    const files = req.files as { [fieldname: string]: Express.Multer.File[] };"
);

fs.writeFileSync('server.ts', code);
