const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const missingTrans = {
  en: `"Quản lý Menu": "Manage Menu",`,
  ko: `"Quản lý Menu": "메뉴 관리",`,
  ja: `"Quản lý Menu": "メニュー管理",`,
  th: `"Quản lý Menu": "จัดการเมนู",`,
  zh: `"Quản lý Menu": "菜单管理",`
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
