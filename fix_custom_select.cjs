const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `interface CustomSelectOption {
  value: string;
  label: string;
}`;

const replacement1 = `interface CustomSelectOption {
  value: string;
  label: string;
  isVip?: boolean;
  disabled?: boolean;
}`;

const target2 = `            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={\`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between \${
                opt.value === value
                  ? 'bg-stone-900 text-white font-bold'
                  : 'text-stone-700 hover:bg-stone-50'
              }\`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>`;

const replacement2 = `            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={\`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between \${
                opt.value === value
                  ? 'bg-stone-900 text-white font-bold'
                  : opt.disabled
                  ? 'text-stone-400 opacity-60 cursor-not-allowed bg-stone-50'
                  : 'text-stone-700 hover:bg-stone-50'
              }\`}
            >
              <div className="flex items-center gap-2 truncate">
                 <span className="truncate">{opt.label}</span>
                 {opt.isVip && (
                   <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
                 )}
              </div>
              {opt.value === value && (
                <svg className={\`w-4 h-4 \${opt.disabled ? 'text-stone-400' : 'text-white'}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>`;

if (code.includes(target1) && code.includes(target2)) {
    code = code.replace(target1, replacement1);
    code = code.replace(target2, replacement2);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed CustomSelect!");
} else {
    console.log("Targets not found!");
}
