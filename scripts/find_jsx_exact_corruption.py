with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.read()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.read()

orig_admin_start = orig.find("function AdminDashboard()")
edit_admin_start = edit.find("function AdminDashboard()")

orig_admin = orig[orig_admin_start:]
edit_admin = edit[edit_admin_start:]

chars = ['{', '}', '(', ')', '[', ']', '<', '>']
for c in chars:
    orig_cnt = orig_admin.count(c)
    edit_cnt = edit_admin.count(c)
    print(f"Token '{c}': Original={orig_cnt}, Edited={edit_cnt}, Diff={edit_cnt - orig_cnt}")
