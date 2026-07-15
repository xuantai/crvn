const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-stone-700 whitespace-nowrap mb-0">{t("Năm phát hành")}:</label>
                      <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("YYYY")} className="w-20 border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm text-center bg-white" maxLength={4} />
                    </div>`;

const currentYear = new Date().getFullYear();

const replacement = `<div className="flex items-center gap-2">
                      <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("${currentYear}")} className="w-16 border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm text-center bg-white" maxLength={4} />
                    </div>`;

if (code.includes(target)) {
  code = code.replaceAll(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced releaseYear logic again!");
} else {
  console.log("Target string not found in src/App.tsx!");
}
