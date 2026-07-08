import re

with open('lint.txt', 'r') as f:
    text = f.read()

errors = re.findall(r'src/App\.tsx\((\d+),\d+\): error TS17008: JSX element \'span\'', text)
errors = [int(e) for e in errors]

with open('src/App.tsx', 'r') as f:
    lines = f.read().split('\n')

for line_num in set(errors):
    # check if there's a <span> in this line
    line = lines[line_num-1]
    if '<span' in line:
        lines[line_num-1] += '</span>'

with open('src/App.tsx', 'w') as f:
    f.write('\n'.join(lines))
