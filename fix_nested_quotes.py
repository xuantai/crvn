import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
modified = False

for idx, line in enumerate(lines):
    # Skip comments
    if line.strip().startswith('//') or line.strip().startswith('/*'):
        continue
        
    t_start = line.find('t("')
    if t_start != -1:
        # Walk from t_start to find the closing parenthesis of the t("...") call
        paren_count = 0
        t_end = -1
        in_quotes = False
        
        # We start searching from after t("
        for c_idx in range(t_start + 3, len(line)):
            char = line[c_idx]
            # Since we have unescaped quotes, we can't easily rely on standard in_quotes toggles.
            # Instead, let's look for the matching paren ')'.
            # A t("...") call ends with a quote followed by a parenthesis: ) or )} or ), etc.
            # Let's check if we see ") or ') or `)
            if char == ')' and (line[c_idx-1] == '"' or line[c_idx-1] == "'" or line[c_idx-1] == '`'):
                t_end = c_idx
                break
            # Or if it's the end of line or before a curly brace, let's be flexible
            if char == ')' and line[c_idx-1].isalnum() == False:
                # Let's see if this is the closing paren of the t(...) call
                # Usually there is only one ) near the end of the expression
                t_end = c_idx
                
        if t_end != -1:
            # Extract the inner string between t(" and the closing ")
            # Let's find the closing quote before t_end
            last_quote = line.rfind('"', 0, t_end)
            if last_quote > t_start + 3:
                inner_str = line[t_start+3 : last_quote]
                # If the inner_str contains unescaped double quotes:
                # (i.e. contains " and they are not escaped with \)
                # Let's replace unescaped double quotes with escaped ones, or use single quotes
                if '"' in inner_str and '\\"' not in inner_str:
                    # Let's use single quotes on the outside!
                    new_t_call = f"t('{inner_str}')"
                    line_replaced = line[:t_start] + new_t_call + line[t_end+1:]
                    print(f"Fixed line {idx+1}:")
                    print(f"  Old: {line}")
                    print(f"  New: {line_replaced}")
                    lines[idx] = line_replaced
                    modified = True

if modified:
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print("Successfully updated App.tsx!")
else:
    print("No nested unescaped quotes found.")
