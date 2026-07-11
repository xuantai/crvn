# Now we also need to close the `tickets` motion.div in AdminDashboard.
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(11700, 11770):
    if '</main>' in lines[i]:
        # insert </motion.div> before the preceding `          )}\n`
        for j in range(i-1, i-10, -1):
            if ')}' in lines[j]:
                lines.insert(j, '            </motion.div>\n')
                print(f"Inserted </motion.div> at {j+1}")
                break
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
