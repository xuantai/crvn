const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data_acxuantai.json'), 'utf-8'));

console.log('=== PAGE / SITE PASSWORDS FOR acxuantai ===');
console.log('pagePassword:', data.pagePassword);
console.log('password:', data.password);
console.log('accessPassword:', data.accessPassword);
console.log('vaultPassword:', data.vaultPassword);
console.log('adminPassword:', data.adminPassword);

console.log('\n=== SONG PASSWORDS (SAMPLE DEMOS) ===');
(data.demos || []).slice(0, 10).forEach(d => {
  console.log(`Song: "${d.title}" | password: ${d.password} | secretKey: ${d.secretKey} | passCode: ${d.passCode || 'none'}`);
});
