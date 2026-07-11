with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace active text color condition
content = content.replace(
    "? 'text-stone-900'\n                        : 'text-stone-500 hover:text-stone-900'",
    "? 'text-white'\n                        : 'text-stone-500 hover:text-stone-900'"
)

# Replace active background
content = content.replace(
    'className="absolute inset-0 bg-white rounded-lg shadow-xs z-0 border border-stone-200/30"',
    'className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

