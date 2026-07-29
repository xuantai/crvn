const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const missingTrans = {
  en: `"Kho Nhạc": "Music Vault",`,
  ko: `"Kho Nhạc": "음악 보관함",`,
  ja: `"Kho Nhạc": "ミュージックボルト",`,
  th: `"Kho Nhạc": "คลังเพลง",`,
  zh: `"Kho Nhạc": "音乐库",`
};

for (const [lang, trans] of Object.entries(missingTrans)) {
  const regex = new RegExp(`^(\\s*${lang}:\\s*\\{)(?=[\\s\\S])`, 'gm');
  let count = 0;
  content = content.replace(regex, (match, p1) => {
    count++;
    if (count <= 2) {
      return `${p1}\n    ${trans}\n`;
    }
    return match;
  });
}

fs.writeFileSync('src/App.tsx', content);
console.log('Dictionaries updated!');
