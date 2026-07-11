import re
import json

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Find t("...")
t_calls = re.findall(r't\((["\'])(.*?)\1\)', content)
t_strings = set([t[1] for t in t_calls])

# Find vi block
vi_block = re.search(r'vi: \{(.*?)\n  \w{2}: \{', content, re.DOTALL)
if vi_block:
    vi_content = vi_block.group(1)
    # The vi_content contains both `"key": "value"` and `key: "value"`
    vi_keys = re.findall(r'(?:^|\s|,)"?([^":]+)"?:\s*"', vi_content)
    # this regex is brittle, let's just use string parsing
    
    # A better way to get keys:
    # Match all string literals that come before a colon
    keys_match = re.findall(r'(?:(?<=[,{])|(?<=^))\s*(?:"([^"]+)"|([a-zA-Z0-9_]+))\s*:', vi_content)
    keys = []
    for m in keys_match:
        if m[0]:
            keys.append(m[0])
        elif m[1]:
            keys.append(m[1])
            
    missing = [s for s in t_strings if s not in keys]
    print(f"Found {len(missing)} missing keys:")
    for m in missing:
        print(m)
else:
    print("Could not parse vi block")

