with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.read()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.read()

orig_marker = orig.find("const useAdminTranslation")
edit_marker = edit.find("const useAdminTranslation")

if orig_marker != -1 and edit_marker != -1:
    orig_sub_lines = orig[orig_marker:].split('\n')
    edit_sub_lines = edit[edit_marker:].split('\n')
    
    # We want to use difflib to find block-level insertions/deletions.
    # Specifically, lines that exist in edit but not in orig, or vice versa, that aren't simple string edits.
    import difflib
    diff = list(difflib.unified_diff(orig_sub_lines, edit_sub_lines, n=1))
    
    print(f"Total diff lines: {len(diff)}")
    # Print the first 100 lines of unified diff to see where an insertion or deletion occurred.
    count = 0
    for line in diff:
        if line.startswith('+++') or line.startswith('---') or line.startswith('@@'):
            print(line.rstrip())
        elif line.startswith('+') or line.startswith('-'):
            # Ignore simple translations: if the change is just wrapping in t(...) or replacing text inside quotes
            # or translating, skip it.
            # E.g. -'Yêu cầu gỡ' vs +t("Yêu cầu gỡ")
            # Let's check if the line contains structural tags like <div>, <button>, etc., or if the diff line is a major insertion.
            # Or simply print ALL diff lines up to 100 lines to let us look at it!
            print(line.rstrip())
            count += 1
            if count > 100:
                print("... truncated")
                break
else:
    print("Marker not found")
