with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line numbers are 1-indexed, so index is line - 1
block_lines = lines[7983:8927] # Lines 7984 to 8927 inclusive
content = "".join(block_lines)

stack = []
pos = 0
line_num = 7984
col_num = 1

while pos < len(content):
    char = content[pos]
    if char == '\n':
        line_num += 1
        col_num = 1
    else:
        col_num += 1
        
    # Strings and comments
    if char in ['"', "'", '`']:
        quote = char
        pos += 1
        if char == '\n': line_num += 1; col_num = 1
        else: col_num += 1
        while pos < len(content):
            if content[pos] == '\\':
                pos += 2
                col_num += 2
                continue
            if content[pos] == quote:
                break
            if content[pos] == '\n': line_num += 1; col_num = 1
            else: col_num += 1
            pos += 1
        pos += 1
        continue
        
    if char == '/' and pos + 1 < len(content) and content[pos+1] == '/':
        while pos < len(content) and content[pos] != '\n':
            pos += 1
        continue
    if char == '/' and pos + 1 < len(content) and content[pos+1] == '*':
        pos += 2
        while pos < len(content) and not (content[pos] == '*' and pos + 1 < len(content) and content[pos+1] == '/'):
            if content[pos] == '\n': line_num += 1; col_num = 1
            else: col_num += 1
            pos += 1
        pos += 2
        continue

    if char in ['{', '(', '[']:
        stack.append((char, line_num, col_num, pos))
    elif char in ['}', ')', ']']:
        if not stack:
            print(f"Error: Found closing '{char}' at line {line_num}, col {col_num} but stack is empty!")
            break
        else:
            top_char, top_line, top_col, top_pos = stack.pop()
            match = True
            if char == '}' and top_char != '{': match = False
            elif char == ')' and top_char != '(': match = False
            elif char == ']' and top_char != '[': match = False
            
            if not match:
                print(f"Mismatched closing '{char}' at line {line_num}, col {col_num}")
                print(f"Expecting closing for '{top_char}' from line {top_line}, col {top_col}")
                # Print context
                break
    pos += 1
else:
    print(f"Block parse finished. Remaining stack: {len(stack)}")
    if stack:
        print("Unclosed elements:")
        for s in stack:
            print(f"  '{s[0]}' at line {s[1]}, col {s[2]}")
