const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<span className="text-xs text-stone-500">\/ tháng<\/span>\s*<\/div>/g;

let count = 0;
code = code.replace(regex, (match) => {
    count++;
    return match + `
                        <button 
                          type="button" 
                          className={\`w-full py-2.5 rounded-xl font-bold text-xs mb-4 transition-all \${isActive ? 'bg-indigo-600 text-white shadow-md cursor-default' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer'}\`}
                          onClick={() => {
                             if (!isActive) {
                                setToast(\`Vui lòng nâng cấp gói tại trang chủ landing page!\`);
                                setTimeout(() => setToast(''), 3000);
                             }
                          }}
                        >
                          {isActive ? t('Đang Sử Dụng') : t('Nâng Cấp Ngay')}
                        </button>`;
});

fs.writeFileSync('src/App.tsx', code);
console.log(`Replaced select button ${count} times`);
