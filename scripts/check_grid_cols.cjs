const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const formContent = code.substring(code.indexOf(startMarker), code.indexOf(endMarker));

const getBlock = (regex) => {
    const match = formContent.match(regex);
    return match ? match[0] : '';
};
const gridColsStr = getBlock(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
console.log(gridColsStr.slice(-100));
