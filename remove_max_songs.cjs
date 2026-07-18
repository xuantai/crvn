const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const toRemove = `    const artist = artists.find(a => a.username === (req as any).artist?.username);
    if (!artist) return res.status(401).json({ error: 'Unauthorized' });

    // Determine max songs
    let maxLimit = 10; // Default for free
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
    if (maxLimit !== -1) {
      const activeCount = data.demos.filter((d: any) => !d.deleted).length;
      if (activeCount >= maxLimit) {
        return res.status(403).json({ error: \`Bạn đã đạt giới hạn đăng bài (\${maxLimit} bài). Vui lòng nâng cấp hạng thành viên hoặc nhập mã voucher.\` });
      }
    }`;

code = code.replace(toRemove, '');
fs.writeFileSync('server.ts', code);
