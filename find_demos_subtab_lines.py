with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.readlines()

for idx, line in enumerate(edit):
    if idx >= 8300 and idx <= 8900:
        if "demosSubTab ===" in line:
            print(f"Line {idx+1}: {line.rstrip()}")
