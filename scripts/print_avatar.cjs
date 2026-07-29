const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const match = code.match(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ<\/label>[\s\S]*?Dùng đại diện cho kho nhạc, nên chọn ảnh vuông\.<\/p>\s*<\/div>/);
console.log(match[0]);
