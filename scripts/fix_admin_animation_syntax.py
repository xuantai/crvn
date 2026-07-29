import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the `{ opacity` to `{{ opacity`
content = content.replace('initial={ opacity', 'initial={{ opacity')
content = content.replace('animate={ opacity', 'animate={{ opacity')
content = content.replace('exit={ opacity', 'exit={{ opacity')
content = content.replace('transition={ duration', 'transition={{ duration')

# Fix the closing braces
content = content.replace(' } className="flex flex-col', ' }} className="flex flex-col')

# Add <AnimatePresence mode="wait"> after <main ...>
main_start_pattern = r'(<main className=\{\`flex-1 bg-white flex flex-col \$\{isPCPreviewMode \? \'rounded-none border-0 shadow-none min-h-0 h-\[calc\(100vh-64px\)\] overflow-hidden\' : \'rounded-none md:rounded-3xl border-0 md:border md:border-stone-200 shadow-none md:shadow-sm p-4 md:p-8 min-h-\[calc\(100vh-64px\)\]\'\}\`\}>)'
content = re.sub(main_start_pattern, r'\1\n          <AnimatePresence mode="wait">', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax")
