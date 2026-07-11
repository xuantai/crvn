with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(11600, 11620):
    if '          )}' in lines[i] and 'Report Song Modal' in lines[i+2]:
        lines.insert(i, '            </motion.div>\n')
        print(f"Inserted </motion.div> before line {i+1}")
        break

for i in range(11750, 11770):
    if '</motion.div>' in lines[i]:
        print(f"Removed </motion.div> at line {i+1}")
        lines.pop(i)
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
