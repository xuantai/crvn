const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const a = document.createElement('a');
                        a.href = url;
                        a.download = \`\${title || 'song'}.mp3\`;`;

const replacement1 = `const a = document.createElement('a');
                        a.href = url;
                        const singerStr = typeof singer !== 'undefined' && singer ? \` - \${singer}\` : '';
                        const demoStr = typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '';
                        a.download = \`\${(title || 'song').trim()}\${singerStr}\${demoStr}.mp3\`;`;

const target2 = `const a = document.createElement('a');
                        a.href = url;
                        a.download = \`\${title || 'song'}.mp3\`;`;

const replacement2 = `const a = document.createElement('a');
                        a.href = url;
                        const singerStr = typeof singer !== 'undefined' && singer ? \` - \${singer}\` : '';
                        const demoStr = typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '';
                        a.download = \`\${(title || 'song').trim()}\${singerStr}\${demoStr}.mp3\`;`;

// Actually wait, let's just replace all instances of a.download = \`\${title || 'song'}.mp3\`;
// Let's use string split and join.

code = code.split(`a.download = \`\${title || 'song'}.mp3\`;`).join(`const sStr = typeof singer !== 'undefined' && singer ? ' - ' + singer : '';
                        const rStr = typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '';
                        a.download = \`\${(title || 'song').trim()}\${sStr}\${rStr}.mp3\`;`);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed downloads!");
