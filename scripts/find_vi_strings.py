import re

# Regex for Vietnamese characters
vi_regex = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', re.IGNORECASE)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Scan lines from 6452 to the end (0-indexed: 6451 onwards)
start_line = 6451
end_line = len(lines)

untranslated_count = 0
results = []

for idx in range(start_line, end_line):
    line_num = idx + 1
    line = lines[idx]
    
    # We want to find Vietnamese words in the line.
    # To check if they are wrapped in t(...), we can check if they are inside t("...") or t('...') or t(`...`)
    # Let's find all Vietnamese substrings in the line
    # (words or phrases containing spaces and Vietnamese characters)
    matches = re.finditer(r'["\'>]?[^"\'>\n]*[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+[^"\'>\n]*["\'<]?', line, re.IGNORECASE)
    
    for match in matches:
        text = match.group().strip()
        # Clean up tags or quotes at boundaries
        if text.startswith('>') or text.startswith('"') or text.startswith("'"):
            text_inner = text[1:]
        else:
            text_inner = text
        if text_inner.endswith('<') or text_inner.endswith('"') or text_inner.endswith("'"):
            text_inner = text_inner[:-1]
        text_inner = text_inner.strip()
        
        if not text_inner:
            continue
            
        # Check if the text is wrapped in t("...") or t('...')
        # A simple check: does the line contain t("text_inner") or similar?
        wrapped = False
        escaped_text = re.escape(text_inner)
        pattern = r't\(\s*["\'`]' + escaped_text + r'["\'`]\s*\)'
        if re.search(pattern, line):
            wrapped = True
            
        # Also check if it's within translations block or comments
        if 'translations' in line or 'translations[' in line or '//' in line or '/*' in line:
            wrapped = True
            
        if not wrapped and vi_regex.search(text_inner):
            results.append((line_num, line.strip(), text_inner))
            untranslated_count += 1

print(f"Found {untranslated_count} potential untranslated Vietnamese occurrences:")
for r in results[:100]:
    print(f"Line {r[0]}: {r[1]} --> [{r[2]}]")
if len(results) > 100:
    print(f"... and {len(results) - 100} more.")
