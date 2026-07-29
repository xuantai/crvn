const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (artist) {
      if (v.increaseSongs > 0) {
        artist.maxSongs = (artist.maxSongs || 0) + v.increaseSongs;
      }`;
      
const replacement = `    if (artist) {
      if (v.increaseSongs > 0) {
        let currentLimit = 10;
        const roleId = artist.roleId || 'free';
        if (roleId === 'vip' || roleId === 'pro') currentLimit = -1;
        const landingConf = await loadLandingConfig();
        const roleDef = (landingConf.roles || []).find((r: any) => r.name.toLowerCase() === roleId.toLowerCase());
        if (roleDef && roleDef.maxPosts) {
          if (roleDef.maxPosts === -1 || roleDef.maxPosts === 'unlimited') currentLimit = -1;
          else currentLimit = Number(roleDef.maxPosts);
        }
        let actualCurrent = artist.maxSongs !== undefined && artist.maxSongs !== null ? artist.maxSongs : currentLimit;
        if (actualCurrent !== -1) {
          artist.maxSongs = actualCurrent + v.increaseSongs;
        }
      }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed voucher logic!");
} else {
    console.log("Target not found!");
}
