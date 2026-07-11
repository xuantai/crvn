with open('src/App.tsx.bak', 'r', encoding='utf-8') as f:
    orig = f.read()

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    edit = f.read()

orig_marker = orig.find("const useAdminTranslation")
edit_marker = edit.find("const useAdminTranslation")

if orig_marker != -1 and edit_marker != -1:
    orig_sub_lines = orig[orig_marker:].split('\n')
    edit_sub_lines = edit[edit_marker:].split('\n')
    
    import difflib
    diff = list(difflib.unified_diff(orig_sub_lines, edit_sub_lines, lineterm=''))
    
    print(f"Total diff lines after useAdminTranslation: {len(diff)}")
    count = 0
    for line in diff:
        if line.startswith('+++') or line.startswith('---') or line.startswith('@@'):
            print(line)
            continue
        
        # We want to ignore lines that are just simple string replacements, like:
        # -      title: "Mở lại yêu cầu",
        # +      title: t("Mở lại yêu cầu"),
        # Or:
        # -                      title="Tạo Playlist"
        # +                      title={t("Tạo Playlist")}
        # So we filter out any lines where the main diff contains 't(' or 't("' or "t('" or similar,
        # unless it is structurally different (e.g. adding or removing elements like divs, buttons).
        if line.startswith('+') or line.startswith('-'):
            val = line[1:].strip()
            # If the change only adds/removes/changes text wrapper translation:
            # Let's check if the line has structural HTML tag like <, >, or ends/begins block structures.
            # E.g. <div>, </div>, <button>, </button>, etc.
            # But let's check if it adds/removes elements.
            # A line like `+                      title={t("Tạo Playlist")}` has `<` or `>`? No.
            # Let's print any line that doesn't contain `t(`
            if 't(' not in val:
                print(line)
                count += 1
                if count > 150:
                    print("... truncated")
                    break
else:
    print("Marker not found")
