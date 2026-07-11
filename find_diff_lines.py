import difflib

with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.readlines()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.readlines()

print(f"Original lines: {len(orig)}, Edited lines: {len(edit)}")

# Find any line mismatch or syntax problems
# Let's run a unified diff of lines from 7980 to 10250 (0-indexed: 7979 to 10249)
# since the TS error mentioned line 7983, 8355, 8927, 10113.
diff = difflib.unified_diff(
    orig[7900:10200],
    edit[7900:10200],
    fromfile='App.tsx.bak',
    tofile='App.tsx',
    n=0
)

# Print first 50 lines of diff
count = 0
for line in diff:
    if line.startswith('+++') or line.startswith('---') or line.startswith('@@'):
        print(line.strip())
    elif line.startswith('+') or line.startswith('-'):
        print(line.strip())
        count += 1
        if count > 80:
            print("... and more diff lines")
            break
