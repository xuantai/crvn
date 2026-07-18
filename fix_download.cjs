const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix in CustomAudioPlayer
const target1 = `                        const sStr = typeof singer !== 'undefined' && singer ? ' - ' + singer : '';
                        const rStr = typeof status !== 'undefined' ? (status === 'released' ? '' : ' (Demo)') : (typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '');
                        a.download = \`\${(title || 'song').trim()}\${sStr}\${rStr}.mp3\`;`;

const replace1 = `                        const sStr = singer ? ' - ' + singer : '';
                        const rStr = isReleased ? '' : ' (Demo)';
                        a.download = \`\${(title || 'song').trim()}\${sStr}\${rStr}.mp3\`;`;
                        
code = code.replace(target1, replace1);

// Fix in the Edit form (around 17140)
const target2 = `                        const sStr = typeof singer !== 'undefined' && singer ? ' - ' + singer : '';
                        const rStr = typeof status !== 'undefined' ? (status === 'released' ? '' : ' (Demo)') : (typeof isReleased !== 'undefined' && !isReleased ? ' (Demo)' : '');
                        a.download = \`\${(title || 'song').trim()}\${sStr}\${rStr}.mp3\`;`;

const replace2 = `                        const sStr = demo.singer || demo.composer ? ' - ' + (demo.singer || demo.composer) : '';
                        const rStr = demo.isReleased ? '' : ' (Demo)';
                        a.download = \`\${(demo.title || 'song').trim()}\${sStr}\${rStr}.mp3\`;`;
                        
code = code.replace(target2, replace2);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated download logic");
