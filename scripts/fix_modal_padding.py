import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_class = '''className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]"'''
new_class = '''className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-14 sm:pb-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]"'''

content = content.replace(old_class, new_class)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed modal padding")
