const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data_acxuantai.json'), 'utf-8'));

console.log('=== ALL PASSWORD FIELDS FOR ACXUANTAI ===');
console.log('adminPassword:', data.adminPassword);
console.log('globalPassword:', data.globalPassword);
console.log('vaultPassword:', data.vaultPassword);
console.log('pagePassword:', data.pagePassword);

console.log('\n=== DEMO PASSWORDS (demos with password set) ===');
(data.demos || []).forEach(d => {
  if (d.password || d.passCode || d.linkType === 'indirect') {
    console.log(`Title: "${d.title}" | password: ${JSON.stringify(d.password)} | passCode: ${JSON.stringify(d.passCode)} | linkType: ${d.linkType}`);
  }
});

console.log('\n=== PLAYLIST PASSWORDS ===');
(data.playlists || []).forEach(p => {
  console.log(`Playlist: "${p.title}" | password: ${JSON.stringify(p.password)} | secretLink: ${JSON.stringify(p.secretLink)}`);
});
