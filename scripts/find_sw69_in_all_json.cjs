const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.json'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf-8');
  const matches = content.match(/uploads%2Fsw69l6795go%2F[^"\s\\]+/g) || [];
  if (matches.length > 0) {
    console.log(`File [${f}] has ${matches.length} references:`);
    matches.forEach(m => console.log('  -', decodeURIComponent(m)));
  }
});
