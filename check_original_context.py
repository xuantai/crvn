with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.readlines()

print("Original file lines 7950 to 8010:")
for idx in range(7949, 8009):
    if idx < len(orig):
        print(f"  {idx+1}: {orig[idx].rstrip()}")
