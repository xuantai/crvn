const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">\s*<h3 className="font-bold text-stone-800 text-sm">Tên tùy chỉnh các Tab Danh Sách Nhạc<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

const matches = code.match(regex);
if (matches && matches.length > 1) {
  // Replace the second occurrence with empty string
  let index = code.indexOf(matches[1]);
  if (index !== -1) {
    code = code.substring(0, index) + code.substring(index + matches[1].length);
  }
}
fs.writeFileSync('src/App.tsx', code);
