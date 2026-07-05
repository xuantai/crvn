const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const startIndex = code.indexOf(startMarker) + startMarker.length;
const endIndex = code.indexOf(endMarker);

const formContent = code.substring(startIndex, endIndex);

const check = (name, regex) => {
    const match = formContent.match(regex);
    if (!match) return console.log(name, "NOT FOUND");
    const str = match[0];
    const opens = (str.match(/<div/g) || []).length;
    const closes = (str.match(/<\/div>/g) || []).length;
    console.log(name, ": Opens:", opens, "Closes:", closes, (opens === closes ? "OK" : "MISMATCH"));
};

check('Giới thiệu', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn<\/label>[\s\S]*?<\/div>/);
check('Tên', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ<\/label>[\s\S]*?<\/div>\s*<\/div>/);
check('Username', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Username \(Phần mở rộng\)<\/label>[\s\S]*?<\/div>\s*<\/div>/);
check('Tiêu đề', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website<\/label>[\s\S]*?<\/div>/);
check('Avatar', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ<\/label>[\s\S]*?Dùng đại diện cho kho nhạc, nên chọn ảnh vuông\.<\/p>\s*<\/div>/);
check('BgImage', /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Ảnh nền trang chủ[\s\S]*?<\/div>\s*<\/div>/);
check('GridCols (Favicon/Thumb)', /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
