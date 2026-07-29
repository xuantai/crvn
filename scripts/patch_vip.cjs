const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update CustomSelect to handle 'disabled' and 'isVip' inside the options
const customSelectCode = `function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  dropdownClassName = ''
}: {
  value: string;
  onChange: (val: string) => void;
  options: (CustomSelectOption & { disabled?: boolean; isVip?: boolean })[];
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={\`w-full bg-white/5 border border-stone-200/20 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all flex items-center justify-between text-white hover:bg-white/10 \${className}\`}
      >
        <span className={selectedOption ? 'text-white font-medium' : 'text-neutral-500 font-medium'}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.label}
              {selectedOption.isVip && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">VIP</span>}
            </span>
          ) : placeholder}
        </span>
        <ChevronDown className={\`w-5 h-5 text-neutral-400 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} />
      </button>

      {isOpen && (
        <div className={\`absolute z-50 mt-2 w-full bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl \${dropdownClassName}\`}>
          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={\`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between group \${
                  option.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : value === option.value
                      ? 'bg-indigo-500/10 text-indigo-400 font-bold'
                      : 'text-neutral-300 hover:bg-white/5'
                }\`}
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {option.isVip && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">VIP</span>}
                </span>
                {value === option.value && !option.disabled && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;

const oldCustomSelectRegex = /function CustomSelect\(\{[\s\S]*?className=\`w-5 h-5 text-neutral-400 transition-transform duration-200 \${isOpen \? 'rotate-180' : ''}\`\} \/>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}/;
if (oldCustomSelectRegex.test(code)) {
  code = code.replace(oldCustomSelectRegex, customSelectCode);
} else {
  console.log("Could not find CustomSelect to replace");
}

fs.writeFileSync('src/App.tsx', code);
