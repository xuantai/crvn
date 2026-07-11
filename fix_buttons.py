import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

liquid_base = 'bg-stone-900/80 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.3)] text-white hover:bg-stone-800/90 hover:border-white/20 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.6),0_6px_14px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out active:scale-[0.98]'

# Remove duplicate transition-all
content = content.replace(' transition-all text-sm cursor-pointer self-start sm:self-auto hover:scale-105 active:scale-95', ' text-sm cursor-pointer self-start sm:self-auto')
content = content.replace(' active:scale-95', '')
content = content.replace(' hover:scale-105', '')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed buttons")
