import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

current_func = None
func_start_line = -1
t_defined = False
t_used = False

for i, line in enumerate(lines):
    func_match = re.search(r'function (\w+)\s*\(', line)
    if func_match:
        if current_func and t_used and not t_defined:
            print(f"Function {current_func} uses t but doesn't define it!")
        current_func = func_match.group(1)
        func_start_line = i + 1
        t_defined = False
        t_used = False
    
    if current_func:
        if 'const t = ' in line or 'const { t } = ' in line or 'const { t, ' in line:
            t_defined = True
        
        # Check if t is used
        if re.search(r'\W(t\s*\(|t\.\w)', line):
            # Ignore some known non-usages if any, but let's just check
            t_used = True

if current_func and t_used and not t_defined:
    print(f"Function {current_func} uses t but doesn't define it!")

