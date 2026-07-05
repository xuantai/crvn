const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Thumbnail \(Kéo thả\)<\/label>[\s\S]*?<p className="text-\[10px\] text-stone-500 mt-2">Ảnh dùng làm thumbnail khi share link web\. Thường là ảnh màn hình giao diện PC\.<\/p>\s*<\/div>\s*<\/div>/g;

code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
console.log('Thumbnail removed');
