const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const formContent = code.substring(code.indexOf(startMarker), code.indexOf(endMarker));

const getBlock = (regex) => {
    const match = formContent.match(regex);
    return match ? match[0] : '';
};
const idx = formContent.indexOf('<hr className="border-stone-200" />\n                <div>\n                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube');

let theRest = '';
if (idx !== -1) {
    theRest = formContent.substring(idx);
}
let submitStrIdx = theRest.indexOf('<div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">');
let beforeSubmit = theRest.substring(0, submitStrIdx);
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn<\/label>[\s\S]*?<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Username \(Phần mở rộng\)<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website<\/label>[\s\S]*?<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div className="flex flex-col gap-3">[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

let opens = (beforeSubmit.match(/<div/g)||[]).length;
let selfClosing = (beforeSubmit.match(/<div[^>]*\/>/g)||[]).length;
let closes = (beforeSubmit.match(/<\/div>/g)||[]).length;
console.log("beforeSubmit Op:", opens, "Self:", selfClosing, "Cl:", closes, "Exp:", opens - selfClosing);
