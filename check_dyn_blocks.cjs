const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const formContent = code.substring(code.indexOf(startMarker), code.indexOf(endMarker));

const getBlock = (regex) => {
    const match = formContent.match(regex);
    return match ? match[0] : '';
};

const avatarStr = getBlock(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ<\/label>[\s\S]*?Dùng đại diện cho kho nhạc, nên chọn ảnh vuông\.<\/p>\s*<\/div>/);
const bgImageStr = getBlock(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Ảnh nền trang chủ[\s\S]*?<\/div>\s*<\/div>/);
const gridColsStr = getBlock(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);

console.log("Avatar:", (avatarStr.match(/<div/g)||[]).length, (avatarStr.match(/<\/div>/g)||[]).length);
console.log("BgImg:", (bgImageStr.match(/<div/g)||[]).length, (bgImageStr.match(/<\/div>/g)||[]).length);
console.log("GridCols:", (gridColsStr.match(/<div/g)||[]).length, (gridColsStr.match(/<\/div>/g)||[]).length);
