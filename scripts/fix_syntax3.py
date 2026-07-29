with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's remove that `                            )}` at line 9419 and 10687
lines = content.split('\n')
if ')}' in lines[9418]:
    lines.pop(9418)
if ')}' in lines[10685]:
    lines.pop(10685) # Need to calculate exact line number
# Let's just do it cleanly

