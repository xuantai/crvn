const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const avatarLabel = '<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ</label>';
let avatarIdx = code.indexOf(avatarLabel);
console.log('Avatar idx:', avatarIdx);
if (avatarIdx !== -1) {
  console.log(code.substring(avatarIdx, avatarIdx + 2000));
}
