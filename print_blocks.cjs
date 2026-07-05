const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const startIndex = code.indexOf(startMarker) + startMarker.length;
const endIndex = code.indexOf(endMarker);
const formContent = code.substring(startIndex, endIndex);

console.log(formContent.match(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ<\/label>[\s\S]*?<\/div>\s*<\/div>/)[0]);
