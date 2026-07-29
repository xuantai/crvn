import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors">Cancel',
    'className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel'
)

with open('src/App.tsx', 'w') as f:
    f.write(code)
