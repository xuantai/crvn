const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCheck = `if (!/vers/i.test(lyricsToProcess) && !/\\bpk\\b/i.test(lyricsToProcess)) {`;
const replaceCheck = `const hasAnnotation = /^\\[?\\s*(pre-?chorus|chorus(?:\\s*\\d+)?|vers?e?(?:\\s*\\d+)?|bridge|drop|ending|coda|intro|outro|rap|dk|đk|pk)\\s*\\]?[:]*$/im.test(lyricsToProcess) || /\\[.*?\\]/.test(lyricsToProcess);\n    if (!hasAnnotation) {`;

code = code.replaceAll(targetCheck, replaceCheck);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated lyrics annotation checking");
