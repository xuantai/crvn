import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

def find_func_start(lines, idx):
    for i in range(idx, -1, -1):
        if re.search(r'function \w+\s*\(|const \w+\s*=\s*\([^)]*\)\s*=>', lines[i]):
            return lines[i].strip()
    return "Unknown"

for i, line in enumerate(lines):
    if 't(' in line and not 'function t(' in line and not 'const t =' in line and not 'const { t }' in line:
        # It calls t(. Let's check if it's a known string like setTimeOut
        if 'setTimeout(' in line or '.text(' in line or '.catch(' in line or '.sort(' in line:
            continue
        print(f"Line {i+1}: {line.strip()}")
        print(f"  Enclosing: {find_func_start(lines, i)}")
