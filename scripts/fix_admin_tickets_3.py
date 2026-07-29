with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(11755, 11770):
    if '</main>' in lines[i]:
        lines.insert(i, '          </AnimatePresence>\n')
        print(f"Inserted </AnimatePresence> before line {i+1}")
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
