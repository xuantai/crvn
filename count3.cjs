const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';
const formContent = code.substring(code.indexOf(startMarker), code.indexOf(endMarker));

let opens = (formContent.match(/<div/g)||[]).length;
let selfClosing = (formContent.match(/<div[^>]*\/>/g)||[]).length;
let closes = (formContent.match(/<\/div>/g)||[]).length;

console.log("Total <div: ", opens);
console.log("Self closing <div: ", selfClosing);
console.log("Closes </div>: ", closes);
console.log("Expected Closes: ", opens - selfClosing);
