const fs = require('fs');
const path = require('path');
const os = require('os');

const brainDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
console.log('Searching transcripts in:', brainDir);

function searchDir(dir) {
  let files;
  try {
    files = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) { return; }

  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchDir(fullPath);
    } else if (f.isFile() && (f.name.endsWith('.jsonl') || f.name.endsWith('.json') || f.name.endsWith('.txt'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('sw69l6795go') || content.includes('1783955141') || content.includes('biography')) {
          const lines = content.split('\n');
          lines.forEach(line => {
            if (line.includes('education') || line.includes('experience') || line.includes('biography') || line.includes('sw69l6795go')) {
              if (line.includes('1783955') || line.includes('sw69l6795go')) {
                console.log(`MATCH IN [${fullPath}]:`);
                console.log('  ', line.substring(0, 300));
              }
            }
          });
        }
      } catch (e) {}
    }
  }
}

searchDir(brainDir);
