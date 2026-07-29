const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const startIndex = code.indexOf(startMarker) + startMarker.length;
const endIndex = code.indexOf(endMarker);

const formContent = code.substring(startIndex, endIndex);

let opens = (formContent.match(/<div/g) || []).length;
let closes = (formContent.match(/<\/div>/g) || []).length;

console.log("Opens:", opens, "Closes:", closes);
