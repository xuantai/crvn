with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The extra </motion.div> is at line 4907
# Let's verify by printing lines 4905-4909
print("Before:")
for i in range(4904, 4909):
    print(f"{i+1}: {lines[i]}", end='')

# Actually, the exact line number might have shifted by 1 or 2. Let's find it.
for i in range(4890, 4915):
    if '</motion.div>' in lines[i] and ')}' in lines[i+1]:
        print(f"Found at {i+1}, removing it.")
        lines.pop(i)
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
