with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.readlines()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.readlines()

orig_idx = next(i for i, l in enumerate(orig) if "function AdminDashboard()" in l)
edit_idx = next(i for i, l in enumerate(edit) if "function AdminDashboard()" in l)

print(f"Original line: {orig_idx + 1}, Edit line: {edit_idx + 1}")
print("Original:")
for i in range(orig_idx, orig_idx + 25):
    print(f"  {i+1}: {orig[i].rstrip()}")

print("\nEdited:")
for i in range(edit_idx, edit_idx + 25):
    print(f"  {i+1}: {edit[i].rstrip()}")
