import re

vi_regex = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', re.IGNORECASE)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We care about lines from 6452 to the end
start_line = 6451
end_line = len(lines)

unique_strings = set()

# Simple regex to find string literals in single/double quotes or between jsx tags
for idx in range(start_line, end_line):
    line = lines[idx]
    
    # Skip comments
    if line.strip().startswith('//') or line.strip().startswith('/*'):
        continue
        
    # Extract strings inside double quotes
    for m in re.finditer(r'"([^"\\]*(?:\\.[^"\\]*)*)"', line):
        val = m.group(1).strip()
        if vi_regex.search(val):
            unique_strings.add(val)
            
    # Extract strings inside single quotes
    for m in re.finditer(r"'([^'\\]*(?:\\.[^'\\]*)*)'", line):
        val = m.group(1).strip()
        if vi_regex.search(val):
            unique_strings.add(val)

    # Extract JSX text (between > and <)
    for m in re.finditer(r'>([^<]+)<', line):
        val = m.group(1).strip()
        # Clean up brackets/curly braces
        val = re.sub(r'\{[^}]*\}', '', val).strip()
        if vi_regex.search(val) and len(val) > 1:
            unique_strings.add(val)

print(f"Found {len(unique_strings)} unique Vietnamese strings in admin section:")
for s in sorted(list(unique_strings)):
    print(f"- {s}")
