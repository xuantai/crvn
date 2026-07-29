const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const formContent = code.substring(code.indexOf(startMarker), code.indexOf(endMarker));
const idx = formContent.indexOf('<hr className="border-stone-200" />\n                <div>\n                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube');
let theRest = formContent.substring(idx);
let submitStrIdx = theRest.indexOf('<div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">');
let submitBlock = theRest.substring(submitStrIdx);

let opens = (submitBlock.match(/<div/g)||[]).length;
let selfClosing = (submitBlock.match(/<div[^>]*\/>/g)||[]).length;
let closes = (submitBlock.match(/<\/div>/g)||[]).length;
console.log("submitBlock Op:", opens, "Self:", selfClosing, "Cl:", closes, "Exp:", opens - selfClosing);
