const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data_acxuantai.json'), 'utf-8'));

console.log('=== REAL SONGS IN data_acxuantai.json ===');
const demos = data.demos || [];
const released = data.releasedSongs || [];

console.log('Released Songs:', released.length);
released.forEach((s, i) => {
  console.log(`${i+1}. [RELEASED] ${s.title} | slug: ${s.slug} | id: ${s.id}`);
});

console.log('\nDemos / Unreleased Songs:', demos.length);
demos.forEach((d, i) => {
  console.log(`${i+1}. [${d.isReleased ? 'RELEASED IN DEMOS' : 'DEMO'}] ${d.title} | slug: ${d.slug} | id: ${d.id} | secretKey: ${d.secretKey}`);
});
