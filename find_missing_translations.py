import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Extract all t("...") or t('...')
t_calls = re.findall(r't\((["\'])(.*?)\1\)', content)
t_strings = set([t[1] for t in t_calls])

# 2. Extract translation keys by finding keys in the first section (vi)
vi_section_match = re.search(r'const adminTranslations: Record<string, Record<string, string>> = \{\n  \'vi\': \{(.*?)\n  \},', content, re.DOTALL)
if vi_section_match:
    vi_section = vi_section_match.group(1)
    en_keys = re.findall(r'^\s*"([^"]+)":', vi_section, re.MULTILINE)
    
    missing = [s for s in t_strings if s not in en_keys]
    print(f"Found {len(missing)} missing translations.")
    for m in missing:
        print(m)
else:
    print("Could not find VI translations.")
