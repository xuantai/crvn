with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate AdminDashboard
start_marker = "function AdminDashboard()"
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find function AdminDashboard()!")
    exit(1)

# Let's check from start_idx to the end of the file.
# We will trace curly braces {}, round parentheses (), and square brackets []
# to see where they mismatch.
# Actually, we can trace character-by-character and print whenever they go unbalanced
# inside JSX, or track the stack.

stack = []
line_num = 1
col_num = 1

# Let's count lines up to start_idx to get the initial line number
for i in range(start_idx):
    if content[i] == '\n':
        line_num += 1

# We only trace from start_idx to the end of the file
pos = start_idx
while pos < len(content):
    char = content[pos]
    
    # Track line and col
    if char == '\n':
        line_num += 1
        col_num = 1
    else:
        col_num += 1
        
    # Standard string skipping:
    # If we are inside a string literal, skip until it ends, handling escape chars.
    if char in ['"', "'", '`']:
        quote = char
        pos += 1
        if char == '\n':
            line_num += 1
            col_num = 1
        else:
            col_num += 1
            
        while pos < len(content):
            if content[pos] == '\\':
                pos += 2 # Skip escape
                col_num += 2
                # (Simple newline check inside escape is ignored for simplicity)
                continue
            if content[pos] == quote:
                break
            if content[pos] == '\n':
                line_num += 1
                col_num = 1
            else:
                col_num += 1
            pos += 1
        pos += 1
        continue
        
    # Skip comments
    if char == '/' and pos + 1 < len(content) and content[pos+1] == '/':
        while pos < len(content) and content[pos] != '\n':
            pos += 1
        continue
    if char == '/' and pos + 1 < len(content) and content[pos+1] == '*':
        pos += 2
        while pos < len(content) and not (content[pos] == '*' and pos + 1 < len(content) and content[pos+1] == '/'):
            if content[pos] == '\n':
                line_num += 1
                col_num = 1
            else:
                col_num += 1
            pos += 1
        pos += 2
        continue
        
    # Stack push/pop
    if char in ['{', '(', '[']:
        stack.append((char, line_num, col_num, pos))
    elif char in ['}', ')', ']']:
        if not stack:
            print(f"Error: Found closing '{char}' at line {line_num}, col {col_num} (index {pos}) but stack is empty!")
            # Let's print surrounding context
            start_context = max(0, pos - 100)
            end_context = min(len(content), pos + 100)
            print(f"Context:\n{content[start_context:end_context]}")
            break
        else:
            top_char, top_line, top_col, top_pos = stack.pop()
            # Check matching
            match = True
            if char == '}' and top_char != '{': match = False
            elif char == ')' and top_char != '(': match = False
            elif char == ']' and top_char != '[': match = False
            
            if not match:
                print(f"Mismatched closing '{char}' at line {line_num}, col {col_num} (index {pos})")
                print(f"Expecting closing for '{top_char}' from line {top_line}, col {top_col} (index {top_pos})")
                # Let's print surrounding context for both
                print("\nOpening Context:")
                print(content[max(0, top_pos - 100):min(len(content), top_pos + 100)])
                print("\nClosing Context:")
                print(content[max(0, pos - 100):min(len(content), pos + 100)])
                break
                
    pos += 1

else:
    print(f"Scan finished. Stack size remaining: {len(stack)}")
    if stack:
        print("Unclosed elements in stack:")
        for s in stack[-10:]:
            print(f"  '{s[0]}' at line {s[1]}, col {s[2]}")
