const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const modalCorrect = `            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 shadow-2xl rounded-3xl p-6 w-full max-w-sm relative font-sans text-stone-900"
            >
              <h3 className="text-lg font-black text-stone-900 mb-2 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500 animate-pulse" />
                Xác nhận đổi giao diện
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Bạn có chắc chắn muốn đổi sang giao diện <strong className="text-stone-800">{pendingTheme === 'gold' ? 'Gold Luxury' : 'Liquid Glass'}</strong> không?
              </p>

              {themeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold leading-relaxed">
                  ⚠️ {themeError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleUndoTheme}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >`;

const targetToReplaceRegex = /<motion\s*\{\/\* Song Content Details \(Middle area\) \*\/\>[\s\S]*?Hoàn Tác\s*<\/button>/;
code = code.replace(/<motion\s*\{\/\* Song Content Details \(Middle area\) \*\/\}[\s\S]*?Hoàn Tác\s*<\/button>/, modalCorrect);

fs.writeFileSync('src/App.tsx', code);
