import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import sys
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'className="hidden" />' in line:
        print(f"Match at {i}:")
        print("\n".join(lines[i:i+8]))
