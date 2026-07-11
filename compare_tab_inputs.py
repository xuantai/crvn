with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.readlines()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.readlines()

# Let's print around the playlists check in both files
print("Backup lines around 8010-8030:")
for idx in range(8005, 8025):
    print(f"  {idx+1}: {orig[idx].rstrip()}")

print("\nEdited lines around 8310-8340:")
for idx in range(8305, 8345):
    print(f"  {idx+1}: {edit[idx].rstrip()}")
