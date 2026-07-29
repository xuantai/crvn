import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's replace pr-2 with pr-4 py-2
content = content.replace('w-full sm:w-auto shrink-0 pr-2', 'w-full sm:w-auto shrink-0 pr-4 py-2')
# Also remove mr-0
content = content.replace('shrink-0 mr-0 cursor-pointer', 'shrink-0 cursor-pointer')
content = content.replace('shrink-0 mr-0" title', 'shrink-0" title')

with open('src/App.tsx', 'w') as f:
    f.write(content)
