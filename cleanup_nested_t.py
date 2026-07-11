import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any nested t(t("...")) with t("...")
# Pattern matches t(\s*t\(\s*(".*?"|'.*?'|`.*?`)\s*\)\s*\)
cleaned = re.sub(r'\bt\(\s*t\(\s*("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)\s*\)\s*\)', r't(\1)', content)

# Also handle potential triply nested or spaces: t( t(
cleaned = re.sub(r'\bt\(\s*t\(\s*("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)\s*\)\s*\)', r't(\1)', cleaned)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(cleaned)

print("Cleanup complete!")
