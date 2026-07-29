import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

if 'Caveat' not in content:
    old_import = "@import 'tailwindcss';"
    new_import = "@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap');\n@import 'tailwindcss';"
    content = content.replace(old_import, new_import)
    
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added Caveat font")
else:
    print("Caveat already there")
