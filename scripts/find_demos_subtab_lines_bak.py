with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.readlines()

for idx, line in enumerate(orig):
    if idx >= 8000 and idx <= 8900:
        if "demosSubTab ===" in line:
            print(f"Line {idx+1}: {line.rstrip()}")
