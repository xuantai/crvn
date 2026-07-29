const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">{t("Đã phát hành")}</label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                        <input type="checkbox" name="isReleased" checked={isReleased} onChange={e => {
                          const checked = e.target.checked;
                          setIsReleased(checked);
                          if (checked) {
                            setPassword('');
                          }
                        }} className="w-6 h-6 rounded border-stone-300 text-stone-900 focus:ring-stone-900 transition-all cursor-pointer" />
                      </label>
                      {isReleased && (
                        <div className="flex-1 max-w-[120px]">
                          <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("YYYY")} className="w-full border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm" maxLength={4} />
                        </div>
                      )}
                    </div>
                  </div>`;

const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200 h-[60px]">
                    <div className="flex items-center gap-3 cursor-pointer shrink-0">
                      <input type="checkbox" id="isReleasedForm" name="isReleased" checked={isReleased} onChange={e => {
                        const checked = e.target.checked;
                        setIsReleased(checked);
                        if (checked) {
                          setPassword('');
                        }
                      }} className="w-6 h-6 rounded border-stone-300 text-stone-900 focus:ring-stone-900 transition-all cursor-pointer" />
                      <label htmlFor="isReleasedForm" className="block text-sm font-bold text-stone-700 cursor-pointer select-none mb-0">{t("Đã phát hành")}</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-stone-700 whitespace-nowrap mb-0">{t("Năm phát hành")}:</label>
                      <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("YYYY")} className="w-20 border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm text-center bg-white" maxLength={4} />
                    </div>
                  </div>`;

if (code.includes(target)) {
  code = code.replaceAll(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced releaseYear logic!");
} else {
  console.log("Target string not found in src/App.tsx!");
}
