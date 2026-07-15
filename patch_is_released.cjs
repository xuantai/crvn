const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="flex items-center gap-2">
                      <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("2026")} className="w-16 border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm text-center bg-white" maxLength={4} />
                    </div>`;

const replacement = `{isReleased && (
                      <div className="flex items-center gap-2">
                        <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder={t("2026")} className="w-16 border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-sm text-center bg-white" maxLength={4} />
                      </div>
                    )}`;

if (code.includes(target)) {
  code = code.replaceAll(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully fixed releaseYear visibility");
} else {
  console.log("Could not find target");
}
