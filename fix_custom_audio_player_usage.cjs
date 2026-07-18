const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `showDownload={!!getAdminToken() || !!getMemberToken()} title={demo.title} />`;
const replacement = `showDownload={!!getAdminToken() || !!getMemberToken()} title={demo.title} singer={demo.singer || demo.composer} isReleased={demo.isReleased} />`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed CustomAudioPlayer usage 1!");
} else {
    console.log("Target 1 not found");
}
