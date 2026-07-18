const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<span className="truncate text-stone-700 font-semibold text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>`;

const replacement = `<span className="truncate text-stone-700 font-semibold text-sm flex items-center gap-2">
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption && selectedOption.isVip && (
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
          )}
        </span>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed CustomSelect selected text!");
}
