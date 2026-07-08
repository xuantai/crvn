import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Fix the {segment} thing
text = re.sub(r'\{segment\}\s*\n\s*\);', r'{segment}\n                  </span>\n                );', text)

# Fix any unclosed return <span ...>{segment};
text = re.sub(r'(return <span[^>]*>\{segment\};)\s*(?=\n)', r'\1</span>', text)

with open('src/App.tsx', 'w') as f:
    f.write(text)

