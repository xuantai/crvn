import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

output = []
# we will just do a simple pass: if we are inside a language block, we keep track of seen keys
# actually, the easiest way is to use a python script that parses line by line
current_dict_lang = None
seen_keys = set()
in_admin_translations = False

for line in lines:
    if line.strip().startswith('const adminTranslations:'):
        in_admin_translations = True
        output.append(line)
        continue
    
    if in_admin_translations:
        # Detect lang start e.g. "vi: {" or "en: {"
        if re.match(r'^\s*[a-z]{2}:\s*\{', line):
            current_dict_lang = line.strip().split(':')[0]
            seen_keys = set()
            output.append(line)
            continue
        
        # Detect lang end "}," or "}" at the end
        if re.match(r'^\s*\},?', line) and current_dict_lang:
            current_dict_lang = None
            output.append(line)
            continue
            
        if current_dict_lang:
            # check for key
            match = re.search(r'^\s*"([^"]+)":', line)
            if match:
                key = match.group(1)
                if key in seen_keys:
                    # skip this line
                    continue
                seen_keys.add(key)
    
    output.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(output)

