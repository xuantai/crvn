import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'                  </motion\.div>\n          \)\}\n              </>\n            \);',
    '                  </motion.div>\n                )}\n              </AnimatePresence>\n            );',
    content
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed tabs animation 2!")
