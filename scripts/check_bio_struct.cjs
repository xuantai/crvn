const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data_acxuantai.json', 'utf-8'));

console.log('Current biography education count:', data.biography?.education?.length);
console.log('Current biography experience count:', data.biography?.experience?.length);

console.log('Sample experience item:', data.biography?.experience?.[0]);
