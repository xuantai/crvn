with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('                            )}\n              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">', '              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">')

with open('src/App.tsx', 'w') as f:
    f.write(content)
