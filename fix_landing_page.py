import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'"Giao Diện"\s*:\s*"[^"]+"', '"Giao Diện": "Landing Page"', content)
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Landing Page")
