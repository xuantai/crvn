import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken motion.div string
content = content.replace(
    'initial={{ opacity: 0, y: 15 } animate={{ opacity: 1, y: 0 } exit={{ opacity: 0, y: -15 } transition={{ duration: 0.2 }}',
    'initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
