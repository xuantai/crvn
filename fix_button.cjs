const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="text-2xl font-black text-stone-900 mb-6">\s*\{role\.price\} ₫ <span className="text-sm font-semibold text-stone-500">\/ tháng<\/span>\s*<\/div>/g;

let count = 0;
code = code.replace(regex, (match) => {
    count++;
    return match + `
                          <button 
                            type="button" 
                            className={\`w-full py-2.5 rounded-xl font-bold text-sm mb-4 transition-all \${isActive ? 'bg-indigo-600 text-white shadow-md cursor-default' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer'}\`}
                            onClick={() => {
                               if (!isActive) {
                                  setToast(\`Tính năng nâng cấp đang được phát triển...\`);
                                  setTimeout(() => setToast(''), 3000);
                               }
                            }}
                          >
                            {isActive ? t('Đang Sử Dụng') : t('Chọn Gói Này')}
                          </button>`;
});

fs.writeFileSync('src/App.tsx', code);
console.log(`Replaced select button ${count} times`);
