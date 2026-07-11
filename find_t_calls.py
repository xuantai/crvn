import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # check for `${t(` or `${t(`
    if re.search(r'\$\{t\([^)]+\)\}', line) or re.search(r't\([^)]+\)', line):
        # ignore lines with 'const t ='
        if 'const t =' in line or 'const { t }' in line:
            continue
        print(f"{i+1}: {line.strip()}")
