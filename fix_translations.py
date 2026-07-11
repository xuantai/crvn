import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

translations_to_inject = {
    "bài nhạc": "songs",
    "Bài nhạc": "Songs",
    "Hiển Thị": "Visibility",
    "Quay lại": "Back"
}

new_content = content
for lang in ['vi', 'en', 'ko', 'ja', 'th', 'zh']:
    # The regex to find each block inside adminTranslations
    # Let's find `lang: {`
    pattern = rf"(?m)^  {lang}: {{"
    
    # We will inject right after `lang: {`
    extra = []
    for k, v in translations_to_inject.items():
        k = k.replace('"', '\\"')
        v_to_use = v if lang == 'en' else k  # For now just map to same or known for EN
        extra.append(f'    "{k}": "{v_to_use}",')
        
    replacement = f"  {lang}: {{\n" + "\n".join(extra)
    new_content = re.sub(pattern, replacement, new_content, count=1)

# Now fix the hardcoded "Quay lại" in line 15606
new_content = new_content.replace('<ArrowLeft className="w-4 h-4" /> Quay lại', '<ArrowLeft className="w-4 h-4" /> {t("Quay lại")}')

with open('src/App.tsx', 'w') as f:
    f.write(new_content)
